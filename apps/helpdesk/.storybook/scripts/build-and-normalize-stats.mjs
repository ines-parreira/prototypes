import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createReadStream, createWriteStream } from 'node:fs'
import {
    access,
    readFile,
    rename,
    stat,
    unlink,
    writeFile,
} from 'node:fs/promises'
import path from 'node:path'

// Chromatic TurboSnap currently assumes every top-level `modules[]` entry in
// preview-stats.json has a `name`. Storybook Rsbuild/Rspack emits a few leading
// grouped buckets (`javascript modules`, `css modules`, etc.) that only contain
// `children`, which makes Chromatic crash while tracing changed stories.
//
// We keep the normal Storybook build output and only normalize the generated
// preview-stats.json so Chromatic sees the flat module list it already supports.
const LARGE_FILE_THRESHOLD_BYTES = 2 * 1024 * 1024 * 1024
const LEADING_NAMELESS_GROUP_COUNT = 5
const MODULES_ARRAY_PREFIX = '\n  "modules": ['

function logInfo(message) {
    process.stdout.write(`${message}\n`)
}

function getOptionValue(args, optionName) {
    const optionPrefix = `${optionName}=`

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index]

        if (arg === optionName) {
            const nextArg = args[index + 1]

            return nextArg && !nextArg.startsWith('-') ? nextArg : true
        }

        if (arg.startsWith(optionPrefix)) {
            return arg.slice(optionPrefix.length)
        }
    }

    return undefined
}

function getStatsPath(args) {
    const statsTarget =
        getOptionValue(args, '--stats-json') ??
        getOptionValue(args, '--webpack-stats-json')

    if (statsTarget === undefined) {
        return null
    }

    if (typeof statsTarget === 'string') {
        const resolvedTarget = path.resolve(statsTarget)

        return resolvedTarget.endsWith('.json')
            ? resolvedTarget
            : path.join(resolvedTarget, 'preview-stats.json')
    }

    const outputDir = getOptionValue(args, '--output-dir')
    const resolvedOutputDir =
        typeof outputDir === 'string'
            ? path.resolve(outputDir)
            : path.resolve('storybook-static')

    return path.join(resolvedOutputDir, 'preview-stats.json')
}

async function normalizeStatsFile(statsPath) {
    const statsFile = await stat(statsPath)

    // The Helpdesk Storybook stats file is close to 4 GB, so the fallback path
    // must stream the file instead of materializing the full JSON in memory.
    if (statsFile.size > LARGE_FILE_THRESHOLD_BYTES) {
        return normalizeLargeStatsFile(statsPath)
    }

    const stats = JSON.parse(await readFile(statsPath, 'utf8'))

    if (!Array.isArray(stats.modules)) {
        throw new Error(`Expected stats.modules to be an array in ${statsPath}`)
    }

    const originalCount = stats.modules.length
    const modules = stats.modules.filter(
        (module) => typeof module?.name === 'string' && module.name.length > 0,
    )
    const removedCount = originalCount - modules.length

    if (removedCount === 0) {
        return
    }

    stats.modules = modules

    await writeFile(statsPath, JSON.stringify(stats))

    logInfo(
        `[storybook] Normalized preview-stats.json for Chromatic: removed ${removedCount} nameless top-level modules`,
    )
}

async function writeChunk(stream, chunk) {
    if (!chunk) {
        return
    }

    if (!stream.write(chunk)) {
        await once(stream, 'drain')
    }
}

async function normalizeLargeStatsFile(statsPath) {
    const tempStatsPath = `${statsPath}.chromatic`
    const reader = createReadStream(statsPath, {
        encoding: 'utf8',
        highWaterMark: 1024 * 1024,
    })
    const writer = createWriteStream(tempStatsPath, { encoding: 'utf8' })

    let phase = 'copyBeforeModules'
    let pending = ''
    let droppedCount = 0
    let separatorWhitespace = ''
    let stack = []
    let inString = false
    let isEscaped = false
    let currentString = ''
    let currentStringDepth = 0
    let currentStringContainer = ''
    let currentTopLevelKey = null
    let currentModuleHasIdentifier = false

    try {
        for await (const chunk of reader) {
            if (phase === 'copyRemainder') {
                await writeChunk(writer, chunk)
                continue
            }

            pending += chunk

            if (phase === 'copyBeforeModules') {
                const prefixIndex = pending.indexOf(MODULES_ARRAY_PREFIX)

                if (prefixIndex === -1) {
                    const safeLength =
                        pending.length - MODULES_ARRAY_PREFIX.length

                    if (safeLength > 0) {
                        await writeChunk(writer, pending.slice(0, safeLength))
                        pending = pending.slice(safeLength)
                    }

                    continue
                }

                const modulesStartIndex =
                    prefixIndex + MODULES_ARRAY_PREFIX.length

                await writeChunk(writer, pending.slice(0, modulesStartIndex))
                pending = pending.slice(modulesStartIndex)
                phase = 'dropLeadingModules'
            }

            let pendingIndex = 0

            while (pendingIndex < pending.length) {
                const char = pending[pendingIndex]

                if (phase === 'dropLeadingModules') {
                    // Rsbuild currently emits exactly five leading top-level
                    // grouping objects without `name`/`id`. We skip only those
                    // buckets and leave the remaining module entries untouched.
                    if (stack.length === 0) {
                        if (char === '{') {
                            stack = ['{']
                            currentTopLevelKey = null
                            currentModuleHasIdentifier = false
                            separatorWhitespace = ''
                        } else if (char === ']') {
                            throw new Error(
                                `Expected at least ${LEADING_NAMELESS_GROUP_COUNT} leading grouped modules in ${statsPath}`,
                            )
                        }

                        pendingIndex += 1
                        continue
                    }

                    if (inString) {
                        if (isEscaped) {
                            isEscaped = false
                        } else if (char === '\\') {
                            isEscaped = true
                        } else if (char === '"') {
                            inString = false

                            if (
                                currentStringDepth === 1 &&
                                currentStringContainer === '{'
                            ) {
                                currentTopLevelKey = currentString
                            }
                        } else if (
                            currentStringDepth === 1 &&
                            currentStringContainer === '{'
                        ) {
                            currentString += char
                        }

                        pendingIndex += 1
                        continue
                    }

                    if (currentTopLevelKey !== null) {
                        if (/\s/.test(char)) {
                            pendingIndex += 1
                            continue
                        }

                        if (char === ':') {
                            if (
                                currentTopLevelKey === 'name' ||
                                currentTopLevelKey === 'id'
                            ) {
                                currentModuleHasIdentifier = true
                            }

                            currentTopLevelKey = null
                            pendingIndex += 1
                            continue
                        }

                        currentTopLevelKey = null
                    }

                    if (char === '"') {
                        inString = true
                        isEscaped = false
                        currentString = ''
                        currentStringDepth = stack.length
                        currentStringContainer = stack.at(-1) ?? ''
                        pendingIndex += 1
                        continue
                    }

                    if (char === '{' || char === '[') {
                        stack.push(char)
                        pendingIndex += 1
                        continue
                    }

                    if (char === '}' || char === ']') {
                        const openingChar = stack.pop()

                        if (
                            (openingChar === '{' && char !== '}') ||
                            (openingChar === '[' && char !== ']')
                        ) {
                            throw new Error(
                                `Malformed JSON structure while normalizing ${statsPath}`,
                            )
                        }

                        if (stack.length === 0) {
                            if (currentModuleHasIdentifier) {
                                throw new Error(
                                    `Expected grouped modules without top-level name/id in ${statsPath}`,
                                )
                            }

                            droppedCount += 1

                            if (droppedCount === LEADING_NAMELESS_GROUP_COUNT) {
                                phase = 'seekFirstKeptModule'
                            }
                        }

                        pendingIndex += 1
                        continue
                    }

                    pendingIndex += 1
                    continue
                }

                if (phase === 'seekFirstKeptModule') {
                    if (char === ',') {
                        pendingIndex += 1
                        continue
                    }

                    if (/\s/.test(char)) {
                        separatorWhitespace += char
                        pendingIndex += 1
                        continue
                    }

                    await writeChunk(writer, separatorWhitespace)
                    await writeChunk(writer, pending.slice(pendingIndex))
                    phase = 'copyRemainder'
                    break
                }
            }

            pending =
                phase === 'copyRemainder' ? '' : pending.slice(pendingIndex)
        }

        if (phase !== 'copyRemainder') {
            throw new Error(
                `Failed to normalize preview-stats.json in ${statsPath}`,
            )
        }

        writer.end()
        await once(writer, 'finish')
        await rename(tempStatsPath, statsPath)
    } catch (error) {
        reader.destroy()
        writer.destroy()

        try {
            await unlink(tempStatsPath)
        } catch {}

        throw error
    }

    logInfo(
        `[storybook] Normalized preview-stats.json for Chromatic: removed ${LEADING_NAMELESS_GROUP_COUNT} nameless top-level modules`,
    )
}

async function runStorybookBuild(args) {
    await new Promise((resolve, reject) => {
        const child = spawn('pnpm', ['exec', 'storybook', 'build', ...args], {
            stdio: 'inherit',
        })

        child.on('error', reject)
        child.on('exit', (code) => {
            if (code === 0) {
                resolve()
                return
            }

            reject(
                new Error(
                    `Storybook build failed with exit code ${code ?? 'unknown'}`,
                ),
            )
        })
    })
}

async function main() {
    const args = process.argv.slice(2)

    await runStorybookBuild(args)

    const statsPath = getStatsPath(args)

    if (!statsPath) {
        return
    }

    try {
        await access(statsPath)
    } catch {
        console.warn(
            `[storybook] Stats file not found at ${statsPath}; skipping Chromatic normalization`,
        )
        return
    }

    await normalizeStatsFile(statsPath)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
