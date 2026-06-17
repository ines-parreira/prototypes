import fs from 'node:fs'
import path from 'node:path'

import type { ModuleImportEntry, PluginMetrics } from './types'

export const ROOT_DIR = path.resolve(__dirname, '../../..')
export const METRICS_DIR = path.resolve(__dirname, '../metrics')

export function toRepoRelative(filePath: string) {
    const normalized = path.isAbsolute(filePath)
        ? path.relative(ROOT_DIR, filePath)
        : filePath

    return normalized.replaceAll(path.sep, '/')
}

function compareStrings(left: string, right: string) {
    if (left < right) {
        return -1
    }

    return left > right ? 1 : 0
}

export function sortKeysDeep(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(sortKeysDeep)
    }

    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>)
                .sort(([left], [right]) => compareStrings(left, right))
                .map(([key, entry]) => [key, sortKeysDeep(entry)]),
        )
    }

    return value
}

export function writeMetricsFile(fileName: string, value: unknown) {
    fs.mkdirSync(METRICS_DIR, { recursive: true })

    const filePath = path.join(METRICS_DIR, fileName)
    fs.writeFileSync(
        filePath,
        `${JSON.stringify(sortKeysDeep(value), null, 4)}\n`,
    )

    return filePath
}

export function createMetricsAccumulator(plugin: string) {
    const byPattern: Record<string, number> = {}
    const byFile: Record<string, Record<string, number>> = {}

    return {
        add(filePath: string, pattern: string, count = 1) {
            const relativePath = toRepoRelative(filePath)

            byPattern[pattern] = (byPattern[pattern] ?? 0) + count
            byFile[relativePath] ??= {}
            byFile[relativePath][pattern] =
                (byFile[relativePath][pattern] ?? 0) + count
        },
        finish(): PluginMetrics {
            const total = Object.values(byPattern).reduce(
                (sum, count) => sum + count,
                0,
            )

            return {
                plugin,
                summary: {
                    total,
                    filesWithFindings: Object.keys(byFile).length,
                },
                byPattern,
                byFile,
            }
        },
    }
}

export function mergePluginMetrics(plugin: string, runs: PluginMetrics[]) {
    const merged = createMetricsAccumulator(plugin)

    for (const run of runs) {
        for (const [filePath, patterns] of Object.entries(run.byFile)) {
            for (const [pattern, count] of Object.entries(patterns)) {
                merged.add(filePath, pattern, count)
            }
        }
    }

    return merged.finish()
}

export function getImportEntryName(entry: ModuleImportEntry) {
    if ((entry.importName.kind as string) === 'Default') {
        return 'default'
    }

    return entry.importName.name
}

export function reportPluginMetrics(metrics: PluginMetrics) {
    console.log(
        `[${metrics.plugin}] ${metrics.summary.total} findings in ${metrics.summary.filesWithFindings} files`,
    )
}
