#!/usr/bin/env node
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'

const { values } = parseArgs({
    options: {
        'pr-reports-dir': { type: 'string' },
        'baseline-reports-dir': { type: 'string' },
        output: { type: 'string' },
        'max-examples-per-rule': { type: 'string', default: '3' },
        'max-rule-groups': { type: 'string', default: '10' },
    },
    allowPositionals: false,
})

if (!values['pr-reports-dir'] || !values.output) {
    console.error(
        'Usage: node scripts/react-doctor/compare-reports.mjs --pr-reports-dir=<path> [--baseline-reports-dir=<path>] --output=<path> [--max-examples-per-rule=<n>] [--max-rule-groups=<n>]',
    )
    process.exit(1)
}

function parsePositiveInteger(value, flagName) {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isInteger(parsed) || parsed <= 0) {
        console.error(
            `Invalid ${flagName} value "${value}". Expected a positive integer.`,
        )
        process.exit(1)
    }
    return parsed
}

const maxExamplesPerRule = parsePositiveInteger(
    values['max-examples-per-rule'],
    '--max-examples-per-rule',
)
const maxRuleGroups = parsePositiveInteger(
    values['max-rule-groups'],
    '--max-rule-groups',
)

function diagnosticKey(diagnostic) {
    return [
        diagnostic.plugin ?? '',
        diagnostic.rule ?? '',
        diagnostic.filePath ?? '',
        diagnostic.line ?? '',
        diagnostic.column ?? '',
        diagnostic.message ?? '',
    ].join('|')
}

function reportKey(report) {
    return report.projectAlias ?? report.project
}

function ruleKey(diagnostic) {
    return `${diagnostic.plugin ?? 'unknown'}/${diagnostic.rule ?? 'unknown'}`
}

function severityRank(severity) {
    if (severity === 'error') {
        return 0
    }
    if (severity === 'warning') {
        return 1
    }
    if (severity === 'info') {
        return 2
    }
    return 3
}

function severityLabel(severity) {
    if (severity === 'error') {
        return 'Errors'
    }
    if (severity === 'warning') {
        return 'Warnings'
    }
    if (severity === 'info') {
        return 'Info'
    }
    return 'Other'
}

function truncateText(input, maxLength = 120) {
    if (!input) {
        return ''
    }
    if (input.length <= maxLength) {
        return input
    }
    return `${input.slice(0, maxLength - 1)}...`
}

function pluralize(count, singular, plural = `${singular}s`) {
    return count === 1 ? singular : plural
}

function formatLocation(diagnostic) {
    if (!diagnostic.filePath) {
        return 'unknown-file'
    }

    const line = diagnostic.line ? `:${diagnostic.line}` : ''
    const column = diagnostic.column ? `:${diagnostic.column}` : ''
    return `${diagnostic.filePath}${line}${column}`
}

function getSeverityCounts(diagnostics) {
    const counts = {
        error: 0,
        warning: 0,
        info: 0,
        other: 0,
    }

    for (const diagnostic of diagnostics) {
        const severity = diagnostic.severity ?? 'other'
        if (severity === 'error') {
            counts.error += 1
        } else if (severity === 'warning') {
            counts.warning += 1
        } else if (severity === 'info') {
            counts.info += 1
        } else {
            counts.other += 1
        }
    }

    return counts
}

function formatSeverityCounts(counts) {
    const parts = []
    if (counts.error > 0) {
        parts.push(`Errors: ${counts.error}`)
    }
    if (counts.warning > 0) {
        parts.push(`Warnings: ${counts.warning}`)
    }
    if (counts.info > 0) {
        parts.push(`Info: ${counts.info}`)
    }
    if (counts.other > 0) {
        parts.push(`Other: ${counts.other}`)
    }
    return parts.join(' | ')
}

async function readReportsFromDirectory(directoryPath) {
    if (!directoryPath) {
        return new Map()
    }

    let entries = []
    try {
        entries = await readdir(directoryPath, { withFileTypes: true })
    } catch {
        return new Map()
    }

    const reports = new Map()
    for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.json')) {
            continue
        }

        const filePath = path.join(directoryPath, entry.name)
        try {
            const report = JSON.parse(await readFile(filePath, 'utf8'))
            const key = reportKey(report)
            if (key) {
                reports.set(key, report)
            }
        } catch {
            continue
        }
    }

    return reports
}

function getNewIssues(prReport, baselineReport) {
    if (!baselineReport) {
        return []
    }

    const baselineKeys = new Set(
        (baselineReport.diagnostics ?? []).map(diagnosticKey),
    )

    return (prReport.diagnostics ?? []).filter(
        (diagnostic) => !baselineKeys.has(diagnosticKey(diagnostic)),
    )
}

function getFixedIssues(prReport, baselineReport) {
    if (!baselineReport) {
        return []
    }

    const prKeys = new Set((prReport.diagnostics ?? []).map(diagnosticKey))

    return (baselineReport.diagnostics ?? []).filter(
        (diagnostic) => !prKeys.has(diagnosticKey(diagnostic)),
    )
}

function getScoreDrop(prReport, baselineReport) {
    const prScore = prReport.score?.score
    const baselineScore = baselineReport?.score?.score

    if (typeof prScore !== 'number' || typeof baselineScore !== 'number') {
        return null
    }

    const delta = prScore - baselineScore
    if (delta >= 0) {
        return null
    }

    return {
        project: prReport.project,
        from: baselineScore,
        to: prScore,
        delta,
    }
}

function groupIssuesBySeverityAndRule(issues) {
    const groupsByKey = new Map()

    for (const issue of issues) {
        const severity = issue.severity ?? 'other'
        const key = `${severity}|${ruleKey(issue)}`
        const group = groupsByKey.get(key) ?? {
            severity,
            rule: ruleKey(issue),
            issues: [],
        }
        group.issues.push(issue)
        groupsByKey.set(key, group)
    }

    return [...groupsByKey.values()].sort((a, b) => {
        const severityDelta =
            severityRank(a.severity) - severityRank(b.severity)
        if (severityDelta !== 0) {
            return severityDelta
        }
        const countDelta = b.issues.length - a.issues.length
        if (countDelta !== 0) {
            return countDelta
        }
        return a.rule.localeCompare(b.rule)
    })
}

function appendIssueGroups(lines, issues) {
    const groups = groupIssuesBySeverityAndRule(issues)
    const visibleGroups = groups.slice(0, maxRuleGroups)
    let currentSeverity = null

    for (const group of visibleGroups) {
        if (group.severity !== currentSeverity) {
            currentSeverity = group.severity
            lines.push(`### ${severityLabel(group.severity)}`)
            lines.push('')
        }

        lines.push(
            `\`${group.rule}\` introduced ${group.issues.length} ${pluralize(group.issues.length, 'issue')}`,
        )

        const examples = group.issues.slice(0, maxExamplesPerRule)
        for (const issue of examples) {
            lines.push(
                `- \`${formatLocation(issue)}\` ${truncateText(issue.message, 120)}`,
            )
        }

        const remainingCount = group.issues.length - examples.length
        if (remainingCount > 0) {
            lines.push(`- ${remainingCount} more in artifacts`)
        }
        lines.push('')
    }

    const omittedGroups = groups.length - visibleGroups.length
    if (omittedGroups > 0) {
        lines.push(
            `_Omitted ${omittedGroups} lower-priority rule group(s). Check artifacts for the full report._`,
        )
        lines.push('')
    }
}

function formatPackageList(projects, limit = 12) {
    const visibleProjects = projects.slice(0, limit)
    const suffix =
        projects.length > visibleProjects.length
            ? `, and ${projects.length - visibleProjects.length} more`
            : ''
    return `${visibleProjects.map((project) => `\`${project}\``).join(', ')}${suffix}`
}

const prReports = await readReportsFromDirectory(values['pr-reports-dir'])
const baselineReports = await readReportsFromDirectory(
    values['baseline-reports-dir'],
)

if (prReports.size === 0) {
    console.error(`No PR reports found in ${values['pr-reports-dir']}`)
    process.exit(1)
}

const comparisons = [...prReports.values()]
    .sort((a, b) => a.project.localeCompare(b.project))
    .map((prReport) => {
        const baselineReport = baselineReports.get(reportKey(prReport))
        return {
            prReport,
            baselineReport,
            newIssues: getNewIssues(prReport, baselineReport),
            fixedIssues: getFixedIssues(prReport, baselineReport),
            scoreDrop: getScoreDrop(prReport, baselineReport),
        }
    })

const newIssues = comparisons.flatMap((comparison) =>
    comparison.newIssues.map((issue) => ({
        ...issue,
        project: comparison.prReport.project,
    })),
)
const fixedIssues = comparisons.flatMap((comparison) => comparison.fixedIssues)
const scoreDrops = comparisons
    .map((comparison) => comparison.scoreDrop)
    .filter(Boolean)
const missingBaselineProjects = comparisons
    .filter((comparison) => !comparison.baselineReport)
    .map((comparison) => comparison.prReport.project)
const scannedProjects = comparisons.map(
    (comparison) => comparison.prReport.project,
)

const lines = []
lines.push('## React Doctor')
lines.push('')

if (newIssues.length > 0) {
    const counts = getSeverityCounts(newIssues)
    const affectedPackageCount = new Set(
        newIssues.map((issue) => issue.project),
    ).size

    lines.push(
        `React Doctor found ${newIssues.length} new ${pluralize(newIssues.length, 'issue')} introduced by this PR.`,
    )
    lines.push('')
    lines.push(
        `${formatSeverityCounts(counts)} | Packages: ${affectedPackageCount}`,
    )
    lines.push('')
    appendIssueGroups(lines, newIssues)
} else if (missingBaselineProjects.length === scannedProjects.length) {
    lines.push(
        'React Doctor scanned this PR, but no baseline reports were available to determine regressions.',
    )
    lines.push('')
} else {
    lines.push('No new React-Doctor issues introduced by this PR.')
    lines.push('')
}

if (scoreDrops.length > 0) {
    lines.push('### Score Drops')
    lines.push('')
    for (const scoreDrop of scoreDrops) {
        lines.push(
            `- \`${scoreDrop.project}\` ${scoreDrop.from} -> ${scoreDrop.to} (${scoreDrop.delta})`,
        )
    }
    lines.push('')
}

if (fixedIssues.length > 0) {
    const fixedRuleCount = new Set(fixedIssues.map(ruleKey)).size
    lines.push(
        `Also fixed ${fixedIssues.length} existing ${pluralize(fixedIssues.length, 'issue')} across ${fixedRuleCount} ${pluralize(fixedRuleCount, 'rule')}.`,
    )
    lines.push('')
}

const footerParts = [
    `Scanned ${scannedProjects.length} affected ${pluralize(scannedProjects.length, 'package')}`,
]
if (missingBaselineProjects.length > 0) {
    footerParts.push(
        `baseline unavailable for ${missingBaselineProjects.length} ${pluralize(missingBaselineProjects.length, 'package')}`,
    )
}
lines.push(`_${footerParts.join('; ')}._`)

if (scannedProjects.length > 0) {
    lines.push('')
    lines.push(`_Packages: ${formatPackageList(scannedProjects)}._`)
}

const markdown = `${lines.join('\n')}\n`
await writeFile(values.output, markdown, 'utf8')
console.log(`React Doctor comparison markdown written to ${values.output}`)
