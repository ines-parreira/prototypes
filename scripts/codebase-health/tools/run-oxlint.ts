import { spawnSync } from 'node:child_process'
import path from 'node:path'

import { ROOT_DIR, toRepoRelative, writeMetricsFile } from '../lib/report.utils'
import { listWorkspaceProjects } from '../lib/workspaces'

const OXLINT_BIN = path.join(ROOT_DIR, 'node_modules/.bin/oxlint')
const MAX_OUTPUT_BUFFER = 512 * 1024 * 1024

type OxlintDiagnostic = {
    code: string
    severity: string
    filename: string
}

type OxlintJsonOutput = {
    diagnostics: OxlintDiagnostic[]
}

export async function runOxlint() {
    const byRule: Record<string, number> = {}
    const byFile: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}
    const failedWorkspaces: string[] = []
    const projects = listWorkspaceProjects()

    for (const project of projects) {
        const result = spawnSync(OXLINT_BIN, ['--format=json'], {
            cwd: project.directory,
            encoding: 'utf8',
            maxBuffer: MAX_OUTPUT_BUFFER,
        })

        let parsed: OxlintJsonOutput

        try {
            parsed = JSON.parse(result.stdout) as OxlintJsonOutput
        } catch {
            console.error(
                `oxlint produced unparseable output for ${project.name}: ${result.stderr?.slice(0, 500)}`,
            )
            failedWorkspaces.push(project.name)
            continue
        }

        for (const diagnostic of parsed.diagnostics) {
            const filePath = toRepoRelative(
                path.resolve(project.directory, diagnostic.filename),
            )

            byRule[diagnostic.code] = (byRule[diagnostic.code] ?? 0) + 1
            byFile[filePath] = (byFile[filePath] ?? 0) + 1
            bySeverity[diagnostic.severity] =
                (bySeverity[diagnostic.severity] ?? 0) + 1
        }
    }

    const total = Object.values(bySeverity).reduce(
        (sum, count) => sum + count,
        0,
    )
    const errors = bySeverity.error ?? 0
    const warnings = bySeverity.warning ?? 0

    writeMetricsFile('oxlint.json', {
        summary: {
            workspaces: projects.length,
            failedWorkspaces: failedWorkspaces.sort(),
            total,
            errors,
            warnings,
            filesWithIssues: Object.keys(byFile).length,
        },
        byRule,
        byFile,
    })

    if (failedWorkspaces.length > 0) {
        return `${total} diagnostics (${errors} errors, ${warnings} warnings) — FAILED workspaces: ${failedWorkspaces.join(', ')}`
    }

    return `${total} diagnostics (${errors} errors, ${warnings} warnings) across ${projects.length} workspaces`
}
