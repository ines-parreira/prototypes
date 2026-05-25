import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const PLUGIN_NAME = 'TsgoCheckerRspackPlugin'
const DIAGNOSTIC_PATTERN =
    /^(?<file>.+):(?<line>\d+):(?<column>\d+) - (?<severity>error|warning) TS(?<code>\d+): (?<message>.*)$/
const ANSI_PATTERN = /\u001b\[[0-9;?]*[A-Za-z]/g
const WATCH_STATUS_PATTERN =
    /^(?:(?:\d{1,2}:\d{2}:\d{2} (?:AM|PM)|\[\d{1,2}:\d{2}:\d{2} (?:AM|PM)\])[\s-]+)?(?<message>Starting compilation in watch mode(?:\.\.\.)?|File change detected\. Starting incremental compilation(?:\.\.\.)?|Found \d+ errors?\. Watching for file changes\.)$/
const TYPESCRIPT_INPUT_PATTERN = /\.(?:cts|mts|tsx?|json)$/

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

function createTsgoArgs({ configFile, tsBuildInfoFile, tsgoBin, watch }) {
    const args = [tsgoBin, '-p', configFile, '--noEmit', 'true']

    if (tsBuildInfoFile) {
        args.push('--incremental', 'true', '--tsBuildInfoFile', tsBuildInfoFile)
    }

    if (watch) {
        args.push('--watch', '--preserveWatchOutput', 'true')
    }

    args.push('--pretty', 'true')

    return args
}

function runTsgo({
    cwd,
    configFile,
    signal,
    tsBuildInfoFile,
    tsgoBin = resolveTsgoBin(),
}) {
    return new Promise((resolve) => {
        if (tsBuildInfoFile) {
            fs.mkdirSync(path.dirname(tsBuildInfoFile), { recursive: true })
        }

        if (signal?.aborted) {
            resolve({ aborted: true, issues: [], stdout: '', stderr: '' })
            return
        }

        const child = spawn(
            process.execPath,
            createTsgoArgs({ configFile, tsBuildInfoFile, tsgoBin }),
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

function normalizeTsgoOutputLine(line) {
    return line.replace(ANSI_PATTERN, '').trim()
}

function isTypeScriptInputFile(file) {
    return TYPESCRIPT_INPUT_PATTERN.test(file)
}

function getCompilerChangedFiles(compiler) {
    return new Set([
        ...(compiler.modifiedFiles ?? []),
        ...(compiler.removedFiles ?? []),
    ])
}

function shouldWaitForFreshWatchResult({ changedFiles, latestResult }) {
    if (!latestResult) {
        return true
    }

    if (changedFiles.size === 0) {
        return true
    }

    return Array.from(changedFiles).some(isTypeScriptInputFile)
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

function wait(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout))
}

class TsgoWatchWorker {
    constructor({
        configFile,
        cwd,
        logger,
        timeoutMs,
        tsBuildInfoFile,
        tsgoBin = resolveTsgoBin(),
    }) {
        this.configFile = configFile
        this.cwd = cwd
        this.logger = logger
        this.timeoutMs = timeoutMs
        this.tsBuildInfoFile = tsBuildInfoFile
        this.tsgoBin = tsgoBin
        this.currentIssues = []
        this.currentRawOutput = ''
        this.outputBuffer = ''
        this.waiters = new Set()
    }

    start() {
        if (this.child) {
            return
        }

        this.isStopping = false

        if (this.tsBuildInfoFile) {
            fs.mkdirSync(path.dirname(this.tsBuildInfoFile), {
                recursive: true,
            })
        }

        this.watchCheckStartTime = performance.now()
        this.child = spawn(
            process.execPath,
            createTsgoArgs({
                configFile: this.configFile,
                tsBuildInfoFile: this.tsBuildInfoFile,
                tsgoBin: this.tsgoBin,
                watch: true,
            }),
            {
                cwd: this.cwd,
                env: process.env,
                stdio: ['ignore', 'pipe', 'pipe'],
            },
        )

        this.child.stdout.on('data', (chunk) => this.handleOutput(chunk))
        this.child.stderr.on('data', (chunk) => this.handleOutput(chunk))
        this.child.on('error', (error) => {
            this.resolveWaiters({
                issues: [],
                processError: error,
            })
        })
        this.child.on('close', (exitCode) => {
            this.child = undefined

            if (!this.isStopping && exitCode) {
                this.resolveWaiters({
                    exitCode,
                    issues: [],
                    stderr: '',
                    stdout: '',
                })
            }
        })
    }

    requestCheck({ changedFiles }) {
        this.start()

        if (
            !shouldWaitForFreshWatchResult({
                changedFiles,
                latestResult: this.latestResult,
            })
        ) {
            return Promise.resolve({
                ...this.latestResult,
                reusedPreviousResult: true,
            })
        }

        const requestedAt = performance.now()
        const waiter = { requestedAt }
        const waitForResult = new Promise((resolve) => {
            waiter.resolve = resolve
            this.waiters.add(waiter)
        })

        return Promise.race([
            waitForResult,
            wait(this.timeoutMs).then(() => {
                this.waiters.delete(waiter)

                return {
                    ...(this.latestResult ?? {
                        issues: [],
                        processError: new Error(
                            `tsgo watch typecheck did not finish within ${formatDuration(
                                requestedAt,
                            )}.`,
                        ),
                    }),
                    timedOut: true,
                }
            }),
        ])
    }

    stop() {
        this.isStopping = true
        this.child?.kill()
        this.child = undefined
        this.resolveWaiters({
            aborted: true,
            issues: [],
        })
        this.waiters.clear()
    }

    handleOutput(chunk) {
        this.outputBuffer += chunk.toString('utf8')
        const lines = this.outputBuffer.split(/\r?\n/)
        this.outputBuffer = lines.pop() ?? ''

        lines.forEach((rawLine) => this.handleOutputLine(rawLine))
    }

    handleOutputLine(rawLine) {
        const stripped = normalizeTsgoOutputLine(rawLine)
        const statusMessage =
            stripped.match(WATCH_STATUS_PATTERN)?.groups?.message

        if (
            statusMessage?.startsWith('Starting compilation') ||
            statusMessage?.startsWith('File change detected')
        ) {
            this.currentIssues = []
            this.currentRawOutput = ''
            this.watchCheckStartTime = performance.now()
            return
        }

        if (statusMessage?.startsWith('Found')) {
            this.completeCurrentCheck()
            return
        }

        const issues = parseTsgoIssues(stripped)
        if (issues.length > 0) {
            this.currentIssues.push(...issues)
        }

        this.currentRawOutput += `${rawLine}\n`
    }

    completeCurrentCheck() {
        const completedAt = performance.now()
        const result = {
            completedAt,
            duration: formatDuration(this.watchCheckStartTime ?? completedAt),
            issues: this.currentIssues,
            prettyOutput: this.currentRawOutput.replace(/^\n+|\n+$/g, ''),
        }

        this.currentIssues = []
        this.currentRawOutput = ''
        this.latestResult = result
        this.resolveWaiters(result)
    }

    resolveWaiters(result) {
        Array.from(this.waiters).forEach((waiter) => {
            if (
                !result.completedAt ||
                result.completedAt >= waiter.requestedAt
            ) {
                waiter.resolve(result)
                this.waiters.delete(waiter)
            }
        })
    }
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
        const isIncremental =
            this.options.incremental ?? compiler.options.mode === 'development'
        const tsBuildInfoFile =
            isIncremental === false
                ? undefined
                : path.resolve(
                      cwd,
                      this.options.tsBuildInfoFile ??
                          'node_modules/.cache/tsgo/rspack.tsbuildinfo',
                  )
        const isAsync =
            this.options.async ?? compiler.options.mode === 'development'
        const useWatchWorker =
            this.options.watchWorker ?? compiler.options.mode === 'development'
        const watchTimeoutMs = this.options.watchTimeoutMs ?? 60000
        let activeCheck
        let iteration = 0
        const checksByCompilation = new WeakMap()
        const watchWorker = new TsgoWatchWorker({
            configFile,
            cwd,
            logger,
            timeoutMs: watchTimeoutMs,
            tsBuildInfoFile,
            tsgoBin: this.options.tsgoBin,
        })

        const startCheck = (compilation) => {
            activeCheck?.abortController?.abort()

            const abortController = useWatchWorker
                ? undefined
                : new AbortController()
            const checkIteration = ++iteration
            const startTime = performance.now()

            logger.info(`Starting tsgo typecheck for ${configFile}`)

            const promise = (
                useWatchWorker
                    ? watchWorker.requestCheck({
                          changedFiles: getCompilerChangedFiles(compiler),
                      })
                    : runTsgo({
                          cwd,
                          configFile,
                          signal: abortController.signal,
                          tsBuildInfoFile,
                          tsgoBin: this.options.tsgoBin,
                      })
            ).then((result) => ({
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
            } else if (result.reusedPreviousResult) {
                logger.info(
                    `tsgo typecheck reused previous result from ${result.duration}`,
                )
            } else {
                logger.info(`tsgo typecheck passed in ${result.duration}`)
            }
        }

        if (isAsync && useWatchWorker) {
            compiler.hooks.environment.tap(PLUGIN_NAME, () => {
                logger.info(`Starting tsgo watch worker for ${configFile}`)
                watchWorker.start()
            })
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
                watchWorker.stop()
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
