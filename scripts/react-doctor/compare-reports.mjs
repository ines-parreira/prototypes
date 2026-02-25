#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'

const { values } = parseArgs({
    options: {
        project: { type: 'string' },
        'pr-report': { type: 'string' },
        'baseline-report': { type: 'string' },
        output: { type: 'string' },
        'max-examples': { type: 'string', default: '8' },
        'max-top-rules': { type: 'string', default: '5' },
    },
    allowPositionals: false,
})

if (!values.project || !values['pr-report'] || !values.output) {
    console.error(
        'Usage: node scripts/react-doctor/compare-reports.mjs --project=<name> --pr-report=<path> [--baseline-report=<path>] --output=<path> [--max-examples=<n>] [--max-top-rules=<n>]',
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

const maxExamples = parsePositiveInteger(
    values['max-examples'],
    '--max-examples',
)
const maxTopRules = parsePositiveInteger(
    values['max-top-rules'],
    '--max-top-rules',
)

function scoreEmoji(score) {
    if (score >= 80) {
        return '🟢'
    }

    if (score >= 60) {
        return '🟡'
    }

    return '🔴'
}

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

function truncateText(input, maxLength = 120) {
    if (!input) {
        return ''
    }
    if (input.length <= maxLength) {
        return input
    }
    return `${input.slice(0, maxLength - 1)}…`
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

function getTopRules(diagnostics, limit) {
    const ruleCounts = new Map()

    for (const diagnostic of diagnostics) {
        const ruleKey = `${diagnostic.plugin ?? 'unknown'}/${diagnostic.rule ?? 'unknown'}`
        ruleCounts.set(ruleKey, (ruleCounts.get(ruleKey) ?? 0) + 1)
    }

    return [...ruleCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([rule, count]) => ({ rule, count }))
}

function formatDiagnosticExamples(diagnostics, limit) {
    return diagnostics.slice(0, limit).map((diagnostic) => {
        const location = diagnostic.filePath
            ? `${diagnostic.filePath}${diagnostic.line ? `:${diagnostic.line}` : ''}`
            : 'unknown-file'
        const severity = diagnostic.severity ?? 'unknown'
        const rule = `${diagnostic.plugin ?? 'unknown'}/${diagnostic.rule ?? 'unknown'}`
        const message = truncateText(diagnostic.message, 100)
        return `- \`${severity}\` \`${rule}\` ${location} - ${message}`
    })
}

function appendDiagnosticsSummary(lines, diagnostics, label, emoji, options) {
    if (diagnostics.length === 0) {
        return
    }

    const counts = getSeverityCounts(diagnostics)
    const severityParts = []
    if (counts.error > 0) {
        severityParts.push(`errors: ${counts.error}`)
    }
    if (counts.warning > 0) {
        severityParts.push(`warnings: ${counts.warning}`)
    }
    if (counts.info > 0) {
        severityParts.push(`info: ${counts.info}`)
    }
    if (counts.other > 0) {
        severityParts.push(`other: ${counts.other}`)
    }

    lines.push(`**${emoji} ${label} (${diagnostics.length}):**`)
    lines.push('')
    lines.push(`- Severity split: ${severityParts.join(', ')}`)

    const topRules = getTopRules(diagnostics, options.maxTopRules)
    if (topRules.length > 0) {
        lines.push(
            `- Top rules: ${topRules.map(({ rule, count }) => `\`${rule}\` (${count})`).join(', ')}`,
        )
    }

    const examples = formatDiagnosticExamples(diagnostics, options.maxExamples)
    if (examples.length > 0) {
        const hasMore = diagnostics.length > options.maxExamples
        lines.push(
            `- Sample issues${hasMore ? ` (showing ${options.maxExamples}/${diagnostics.length})` : ''}:`,
        )
        lines.push(...examples)
    }

    lines.push('')
}

async function readReport(filePath) {
    if (!filePath) {
        return null
    }

    try {
        const raw = await readFile(filePath, 'utf8')
        return JSON.parse(raw)
    } catch {
        return null
    }
}

const prReport = await readReport(values['pr-report'])
const baselineReport = await readReport(values['baseline-report'])

if (!prReport) {
    console.error(`PR report not found or invalid: ${values['pr-report']}`)
    process.exit(1)
}

const lines = []
lines.push(`### \`${values.project}\``)
lines.push('')

if (!baselineReport) {
    lines.push(
        '> ℹ️ No baseline found. This may be the first scan or latest baseline is unavailable.',
    )
    lines.push('')
    if (prReport.score) {
        lines.push(
            `**PR Score:** ${scoreEmoji(prReport.score.score)} ${prReport.score.score} (${prReport.score.label})`,
        )
        lines.push('')
    }

    appendDiagnosticsSummary(
        lines,
        prReport.diagnostics ?? [],
        'PR issues',
        '📌',
        {
            maxExamples,
            maxTopRules,
        },
    )
} else {
    const baselineScore = baselineReport.score
    const prScore = prReport.score
    const baselineScoreLabel = baselineScore
        ? `${scoreEmoji(baselineScore.score)} ${baselineScore.score} (${baselineScore.label})`
        : 'N/A'
    const prScoreLabel = prScore
        ? `${scoreEmoji(prScore.score)} ${prScore.score} (${prScore.label})`
        : 'N/A'

    lines.push('| | main | PR |')
    lines.push('|---|---|---|')
    lines.push(`| Score | ${baselineScoreLabel} | ${prScoreLabel} |`)
    lines.push('')

    if (baselineScore && prScore) {
        const delta = prScore.score - baselineScore.score
        if (delta < 0) {
            lines.push(
                `> ⚠️ **Score decreased by ${Math.abs(delta)} points** (${baselineScore.score} -> ${prScore.score})`,
            )
            lines.push('')
        } else if (delta > 0) {
            lines.push(
                `> ✅ **Score increased by ${delta} points** (${baselineScore.score} -> ${prScore.score})`,
            )
            lines.push('')
        }
    }

    const prDiagnostics = prReport.diagnostics ?? []
    const baselineDiagnostics = baselineReport.diagnostics ?? []
    const baselineKeys = new Set(baselineDiagnostics.map(diagnosticKey))
    const prKeys = new Set(prDiagnostics.map(diagnosticKey))

    const newIssues = prDiagnostics.filter(
        (diagnostic) => !baselineKeys.has(diagnosticKey(diagnostic)),
    )
    const fixedIssues = baselineDiagnostics.filter(
        (diagnostic) => !prKeys.has(diagnosticKey(diagnostic)),
    )

    appendDiagnosticsSummary(lines, newIssues, 'New issues', '🆕', {
        maxExamples,
        maxTopRules,
    })

    appendDiagnosticsSummary(lines, fixedIssues, 'Fixed issues', '✅', {
        maxExamples,
        maxTopRules,
    })

    if (newIssues.length === 0 && fixedIssues.length === 0) {
        lines.push('_✅ No diagnostic changes._')
        lines.push('')
    }
}

const markdown = `${lines.join('\n')}\n`
await writeFile(values.output, markdown, 'utf8')
console.log(`React Doctor comparison markdown written to ${values.output}`)
