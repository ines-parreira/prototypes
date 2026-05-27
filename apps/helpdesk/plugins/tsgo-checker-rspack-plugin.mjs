import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

const PLUGIN_NAME = 'TsgoCheckerRspackPlugin'
const DIAGNOSTIC_PATTERN =
    /^(?<file>.+):(?<line>\d+):(?<column>\d+) - (?<severity>error|warning) TS(?<code>\d+): (?<message>.*)$/
const ANSI_PATTERN = /\u001b\[[0-9;?]*[A-Za-z]/g

const require = createRequire(import.meta.url)

export function parseTsgoIssues(output) {
    return output
        .replace(ANSI_PATTERN, '')
        .split(/\r?\n/)
        .map((line) => line.trim().match(DIAGNOSTIC_PATTERN)?.groups)
        .filter(Boolean)
        .map((issue) => ({
            file: path.normalize(issue.file),
            line: Number(issue.line),
            column: Number(issue.column),
            severity: issue.severity,
            code: `TS${issue.code}`,
            message: issue.message,
        }))
}

export function formatTsgoIssue(issue) {
    return `${issue.file}(${issue.line},${issue.column}): ${issue.severity} ${issue.code}: ${issue.message}`
}

function resolveTsgoBin() {
    const packageJsonPath =
        require.resolve('@typescript/native-preview/package.json')
    const packageJson = require(packageJsonPath)

    return path.join(path.dirname(packageJsonPath), packageJson.bin.tsgo)
}

function createRspackError(issue, compiler) {
    const error = compiler.webpack?.WebpackError
        ? new compiler.webpack.WebpackError(formatTsgoIssue(issue))
        : new Error(formatTsgoIssue(issue))

    error.name = PLUGIN_NAME
    error.file = issue.file
    error.loc = `${issue.line}:${issue.column}`

    return error
}

function createTsgoProcessError(result) {
    return new Error(
        [
            `tsgo exited with code ${result.exitCode}.`,
            result.stderr.replace(ANSI_PATTERN, '').trim(),
            result.stdout.replace(ANSI_PATTERN, '').trim(),
        ]
            .filter(Boolean)
            .join('\n'),
    )
}

function formatDuration(startTime) {
    return `${((performance.now() - startTime) / 1000).toFixed(2)}s`
}

function createTsgoArgs({ configFile, tsgoBin }) {
    return [tsgoBin, '-p', configFile, '--noEmit', 'true', '--pretty', 'true']
}

function runTsgo({ cwd, configFile, signal, tsgoBin = resolveTsgoBin() }) {
    return new Promise((resolve) => {
        if (signal?.aborted) {
            resolve({ aborted: true, issues: [], stdout: '', stderr: '' })
            return
        }

        const child = spawn(
            process.execPath,
            createTsgoArgs({ configFile, tsgoBin }),
            {
                cwd,
                env: process.env,
                stdio: ['ignore', 'pipe', 'pipe'],
            },
        )
        const stdout = []
        const stderr = []
        let didResolve = false

        const resolveOnce = (result) => {
            if (didResolve) {
                return
            }

            didResolve = true
            signal?.removeEventListener('abort', abort)
            resolve(result)
        }
        const abort = () => {
            child.kill()
            resolveOnce({
                aborted: true,
                issues: [],
                stdout: Buffer.concat(stdout).toString('utf8'),
                stderr: Buffer.concat(stderr).toString('utf8'),
            })
        }

        signal?.addEventListener('abort', abort, { once: true })
        child.stdout.on('data', (chunk) => stdout.push(chunk))
        child.stderr.on('data', (chunk) => stderr.push(chunk))
        child.on('error', (error) => {
            resolveOnce({
                issues: [],
                processError: error,
                stdout: Buffer.concat(stdout).toString('utf8'),
                stderr: Buffer.concat(stderr).toString('utf8'),
            })
        })
        child.on('close', (exitCode) => {
            const stdoutText = Buffer.concat(stdout).toString('utf8')
            const stderrText = Buffer.concat(stderr).toString('utf8')
            const issues = parseTsgoIssues(`${stdoutText}\n${stderrText}`)

            resolveOnce({
                issues,
                exitCode,
                stdout: stdoutText,
                stderr: stderrText,
                prettyOutput: stdoutText,
            })
        })
    })
}

function isPending(promise) {
    return Promise.race([
        promise.then(
            () => false,
            () => false,
        ),
        Promise.resolve(true),
    ])
}

export class TsgoCheckerRspackPlugin {
    constructor(options = {}) {
        this.options = options
    }

    apply(compiler) {
        const logger = compiler.getInfrastructureLogger(PLUGIN_NAME)
        const cwd = this.options.context ?? compiler.context ?? process.cwd()
        const configFile = path.resolve(
            cwd,
            this.options.configFile ?? 'tsconfig.json',
        )
        const isAsync =
            this.options.async ?? compiler.options.mode === 'development'
        let activeCheck
        let iteration = 0
        const checksByCompilation = new WeakMap()

        const startCheck = (compilation) => {
            activeCheck?.abortController?.abort()

            const abortController = new AbortController()
            const checkIteration = ++iteration
            const startTime = performance.now()

            logger.info(`Starting tsgo typecheck for ${configFile}`)

            const promise = runTsgo({
                cwd,
                configFile,
                signal: abortController.signal,
                tsgoBin: this.options.tsgoBin,
            }).then((result) => ({
                ...result,
                duration: result.duration ?? formatDuration(startTime),
                iteration: checkIteration,
            }))

            activeCheck = {
                abortController,
                iteration: checkIteration,
                promise,
            }
            checksByCompilation.set(compilation, activeCheck)

            return activeCheck
        }

        const reportIssues = (result) => {
            if (result.aborted) {
                return
            }

            if (result.processError) {
                logger.error(result.processError.message)
            } else if (result.issues.length > 0) {
                const prettyOutput =
                    result.prettyOutput ||
                    result.issues.map(formatTsgoIssue).join('\n')
                process.stderr.write(`\n${prettyOutput}\n\n`)
                logger.info(
                    `tsgo typecheck found ${result.issues.length} ${
                        result.issues.length === 1 ? 'error' : 'errors'
                    } in ${result.duration}`,
                )
            } else if (result.exitCode) {
                logger.error(createTsgoProcessError(result).message)
            } else {
                logger.info(`tsgo typecheck passed in ${result.duration}`)
            }
        }

        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            if (compilation.compiler !== compiler) {
                return
            }

            startCheck(compilation)
        })

        if (isAsync) {
            compiler.hooks.done.tap(PLUGIN_NAME, async (stats) => {
                if (stats.compilation.compiler !== compiler) {
                    return
                }

                const check = checksByCompilation.get(stats.compilation)

                if (!check) {
                    return
                }

                if (await isPending(check.promise)) {
                    logger.info('tsgo typecheck in progress...')
                }

                const result = await check.promise

                if (activeCheck !== check || result.aborted) {
                    return
                }

                reportIssues(result)
            })
            compiler.hooks.watchClose?.tap(PLUGIN_NAME, () => {
                activeCheck?.abortController?.abort()
                activeCheck = undefined
            })
            return
        }

        compiler.hooks.afterCompile.tapPromise(
            PLUGIN_NAME,
            async (compilation) => {
                if (compilation.compiler !== compiler) {
                    return
                }

                const check = checksByCompilation.get(compilation)

                if (!check) {
                    return
                }

                const result = await check.promise

                if (result.aborted) {
                    return
                }

                if (result.processError) {
                    compilation.errors.push(result.processError)
                    return
                }

                result.issues.forEach((issue) => {
                    compilation.errors.push(createRspackError(issue, compiler))
                })

                if (result.issues.length === 0 && result.exitCode) {
                    compilation.errors.push(createTsgoProcessError(result))
                }
            },
        )
    }
}
