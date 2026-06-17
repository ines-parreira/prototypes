import { spawnSync } from 'node:child_process'
import path from 'node:path'

import { ROOT_DIR, writeMetricsFile } from '../lib/report.utils'

const FALLOW_BIN = path.join(ROOT_DIR, 'node_modules/.bin/fallow')
const MAX_OUTPUT_BUFFER = 512 * 1024 * 1024

type FallowIssue = {
    path?: string
}

type FallowDeadCodeOutput = {
    summary: Record<string, number>
} & Record<string, unknown>

type FallowDupesOutput = {
    clone_groups: Array<{
        instances: Array<{ file: string }>
        line_count: number
        token_count: number
    }>
    stats: {
        total_files: number
        files_with_clones: number
        total_lines: number
        duplicated_lines: number
        clone_groups: number
        clone_instances: number
        duplication_percentage: number
        clone_groups_below_min_occurrences?: number
        total_tokens?: number
        duplicated_tokens?: number
    }
}

type FallowHealthOutput = {
    summary: Record<string, unknown>
    health_score: {
        score: number
        grade: string
        penalties: Record<string, number>
    }
    vital_signs: Record<string, unknown>
    findings: Array<{
        path: string
        severity: string
    }>
}

function runFallowCommand<T>(args: string[]): T {
    const result = spawnSync(
        FALLOW_BIN,
        [...args, '--format', 'json', '--quiet'],
        {
            cwd: ROOT_DIR,
            encoding: 'utf8',
            maxBuffer: MAX_OUTPUT_BUFFER,
        },
    )

    // fallow exits non-zero when it has findings, so only an unparseable
    // stdout counts as a real failure
    try {
        return JSON.parse(result.stdout) as T
    } catch {
        throw new Error(
            `fallow ${args.join(' ')} produced unparseable output (status ${result.status}): ${result.stderr?.slice(0, 500)}`,
        )
    }
}

function countIssuesByFile(output: Record<string, unknown>) {
    const byFile: Record<string, number> = {}

    for (const [key, value] of Object.entries(output)) {
        if (key === 'workspace_diagnostics' || !Array.isArray(value)) {
            continue
        }

        for (const issue of value as FallowIssue[]) {
            if (typeof issue.path !== 'string') {
                continue
            }

            const filePath = issue.path.replaceAll(path.sep, '/')
            byFile[filePath] = (byFile[filePath] ?? 0) + 1
        }
    }

    return byFile
}

function runDeadCode() {
    const output = runFallowCommand<FallowDeadCodeOutput>(['dead-code'])

    writeMetricsFile('fallow-dead-code.json', {
        summary: output.summary,
        byFile: countIssuesByFile(output),
    })

    return `dead-code=${output.summary.total_issues}`
}

function runDupes() {
    const output = runFallowCommand<FallowDupesOutput>([
        'dupes',
        '--production',
    ])
    const byFile: Record<string, number> = {}

    for (const cloneGroup of output.clone_groups) {
        for (const instance of cloneGroup.instances) {
            const filePath = instance.file.replaceAll(path.sep, '/')
            byFile[filePath] = (byFile[filePath] ?? 0) + 1
        }
    }

    const { stats } = output

    writeMetricsFile('fallow-dupes.json', {
        summary: {
            scope: 'production',
            totalFiles: stats.total_files,
            filesWithClones: stats.files_with_clones,
            totalLines: stats.total_lines,
            duplicatedLines: stats.duplicated_lines,
            totalTokens: stats.total_tokens,
            duplicatedTokens: stats.duplicated_tokens,
            duplicationPercentage:
                Math.round(stats.duplication_percentage * 100) / 100,
            cloneGroups: stats.clone_groups,
            cloneGroupsBelowMinOccurrences:
                stats.clone_groups_below_min_occurrences,
            cloneInstances: stats.clone_instances,
        },
        byFile,
    })

    return `dupes=${stats.clone_groups}`
}

function runHealth() {
    const output = runFallowCommand<FallowHealthOutput>(['health'])
    const byFile: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}

    for (const finding of output.findings) {
        const filePath = finding.path.replaceAll(path.sep, '/')
        byFile[filePath] = (byFile[filePath] ?? 0) + 1
        bySeverity[finding.severity] = (bySeverity[finding.severity] ?? 0) + 1
    }

    writeMetricsFile('fallow-health.json', {
        summary: {
            ...output.summary,
            healthScore: output.health_score.score,
            healthGrade: output.health_score.grade,
            penalties: output.health_score.penalties,
        },
        vitalSigns: output.vital_signs,
        bySeverity,
        byFile,
    })

    return `health-score=${output.health_score.score}`
}

export async function runFallow() {
    const headlines = [runDeadCode(), runDupes(), runHealth()]

    return headlines.join(', ')
}
