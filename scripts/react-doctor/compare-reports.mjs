#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'

const { values } = parseArgs({
    options: {
        project: { type: 'string' },
        'pr-report': { type: 'string' },
        'baseline-report': { type: 'string' },
        output: { type: 'string' },
    },
    allowPositionals: false,
})

if (!values.project || !values['pr-report'] || !values.output) {
    console.error(
        'Usage: node scripts/react-doctor/compare-reports.mjs --project=<name> --pr-report=<path> [--baseline-report=<path>] --output=<path>',
    )
    process.exit(1)
}

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

function formatDiagnosticsBlock(diagnostics) {
    const items = diagnostics.map((diagnostic) => ({
        file: diagnostic.filePath ?? null,
        line: diagnostic.line ?? null,
        rule: diagnostic.rule,
        severity: diagnostic.severity,
        category: diagnostic.category ?? null,
        message: diagnostic.message,
        ...(diagnostic.help ? { help: diagnostic.help } : {}),
        plugin: diagnostic.plugin,
    }))

    return `\`\`\`json\n${JSON.stringify(items, null, 2)}\n\`\`\``
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

    if (newIssues.length > 0) {
        lines.push(`**🆕 New issues (${newIssues.length}):**`)
        lines.push('')
        lines.push(formatDiagnosticsBlock(newIssues))
        lines.push('')
    }

    if (fixedIssues.length > 0) {
        lines.push(`**✅ Fixed issues (${fixedIssues.length}):**`)
        lines.push('')
        lines.push(formatDiagnosticsBlock(fixedIssues))
        lines.push('')
    }

    if (newIssues.length === 0 && fixedIssues.length === 0) {
        lines.push('_✅ No diagnostic changes._')
        lines.push('')
    }
}

const markdown = `${lines.join('\n')}\n`
await writeFile(values.output, markdown, 'utf8')
console.log(`React Doctor comparison markdown written to ${values.output}`)
