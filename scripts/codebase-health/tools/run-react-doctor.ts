import path from 'node:path'

import { diagnose } from 'react-doctor/api'

import { toRepoRelative, writeMetricsFile } from '../lib/report.utils'
import { listWorkspaceProjects } from '../lib/workspaces'

type ProjectReport = {
    score: number | null
    label: string | null
    skipped: string | null
    skippedChecks: string[]
    summary: {
        total: number
        errors: number
        warnings: number
    }
    byRule: Record<string, number>
    byFile: Record<string, number>
}

export async function runReactDoctor() {
    const projects = listWorkspaceProjects()
    const projectReports: Record<string, ProjectReport> = {}
    let totalDiagnostics = 0
    let totalErrors = 0
    let totalWarnings = 0

    for (const project of projects) {
        console.log(`react-doctor: diagnosing ${project.name}…`)

        let result

        try {
            result = await diagnose(project.directory, {
                lint: true,
                deadCode: true,
            })
        } catch (error) {
            // Non-React packages (utils, types, config…) are expected to
            // be rejected by react-doctor; record and move on
            projectReports[project.name] = {
                score: null,
                label: null,
                skipped: error instanceof Error ? error.name : String(error),
                skippedChecks: [],
                summary: { total: 0, errors: 0, warnings: 0 },
                byRule: {},
                byFile: {},
            }
            continue
        }

        const byRule: Record<string, number> = {}
        const byFile: Record<string, number> = {}
        let errors = 0
        let warnings = 0

        for (const diagnostic of result.diagnostics) {
            if (diagnostic.severity === 'error') {
                errors += 1
            } else if (diagnostic.severity === 'warning') {
                warnings += 1
            }

            const rule = `${diagnostic.plugin}/${diagnostic.rule}`
            const filePath = toRepoRelative(
                path.resolve(project.directory, diagnostic.filePath),
            )

            byRule[rule] = (byRule[rule] ?? 0) + 1
            byFile[filePath] = (byFile[filePath] ?? 0) + 1
        }

        projectReports[project.name] = {
            score: result.score?.score ?? null,
            label: result.score?.label ?? null,
            skipped: null,
            skippedChecks: [...result.skippedChecks].sort(),
            summary: {
                total: result.diagnostics.length,
                errors,
                warnings,
            },
            byRule,
            byFile,
        }

        totalDiagnostics += result.diagnostics.length
        totalErrors += errors
        totalWarnings += warnings
    }

    writeMetricsFile('react-doctor.json', {
        summary: {
            projects: projects.length,
            totalDiagnostics,
            errors: totalErrors,
            warnings: totalWarnings,
        },
        projects: projectReports,
    })

    return `${totalDiagnostics} diagnostics (${totalErrors} errors, ${totalWarnings} warnings) across ${projects.length} projects`
}
