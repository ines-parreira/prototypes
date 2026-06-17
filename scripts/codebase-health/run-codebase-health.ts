import { execSync } from 'node:child_process'
import path from 'node:path'
import { parseArgs } from 'node:util'

import { generateCodebaseHealthSummary } from './generate-summary-html'
import { ROOT_DIR, writeMetricsFile } from './lib/report.utils'
import type { ToolStepResult } from './lib/types'
import { runFallow } from './tools/run-fallow'
import { runOxlint } from './tools/run-oxlint'
import { runReactDoctor } from './tools/run-react-doctor'
import { runStaticAnalysis } from './tools/run-static-analysis'

const steps = [
    { tool: 'react-doctor', run: runReactDoctor },
    { tool: 'fallow', run: runFallow },
    { tool: 'oxlint', run: runOxlint },
    { tool: 'static-analysis', run: runStaticAnalysis },
]

async function main() {
    const { values } = parseArgs({
        options: {
            only: { type: 'string' },
        },
        allowPositionals: false,
    })

    const availableTools = steps.map((step) => step.tool)

    if (values.only && !availableTools.includes(values.only)) {
        console.error(
            `Unknown tool "${values.only}". Expected one of: ${availableTools.join(', ')}.`,
        )
        process.exit(1)
    }

    const selectedSteps = values.only
        ? steps.filter((step) => step.tool === values.only)
        : steps
    const results: ToolStepResult[] = []

    for (const step of selectedSteps) {
        console.log(`\n▶ Running ${step.tool}…`)
        const startedAt = Date.now()

        try {
            const headline = await step.run()
            results.push({ tool: step.tool, status: 'ok', headline })
        } catch (error) {
            results.push({
                tool: step.tool,
                status: 'failed',
                headline:
                    error instanceof Error ? error.message : String(error),
            })
        }

        console.log(
            `  ${step.tool} done in ${Math.round((Date.now() - startedAt) / 1000)}s`,
        )
    }

    writeMetricsFile('meta.json', {
        commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
        generatedAt: new Date().toISOString(),
        selectedTools: selectedSteps.map((step) => step.tool),
        toolResults: results,
    })

    const summary = generateCodebaseHealthSummary()
    console.log(
        `\nHTML summary: ${path.relative(ROOT_DIR, summary.outputPath)}`,
    )

    console.table(
        results.map((result) => ({
            Tool: result.tool,
            Status: result.status,
            Summary: result.headline,
        })),
    )

    if (results.some((result) => result.status === 'failed')) {
        process.exit(1)
    }
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
