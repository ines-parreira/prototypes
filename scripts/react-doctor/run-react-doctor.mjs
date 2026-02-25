#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'

import { diagnose } from 'react-doctor/api'

const { values } = parseArgs({
    options: {
        project: { type: 'string' },
        'output-dir': {
            type: 'string',
            default: '.diagnostics/react-doctor-reports',
        },
        'fail-on': { type: 'string', default: 'none' },
    },
    allowPositionals: false,
})

if (!values.project) {
    console.error('Missing required argument: --project=<nx-project-name>')
    process.exit(1)
}

if (!new Set(['none', 'error', 'warning']).has(values['fail-on'])) {
    console.error(
        `Invalid --fail-on value "${values['fail-on']}". Expected one of: none, error, warning.`,
    )
    process.exit(1)
}

function getProjectRoot(projectName) {
    try {
        const output = execSync(
            `pnpm exec nx show project "${projectName}" --json`,
            {
                encoding: 'utf8',
                env: {
                    ...process.env,
                    NX_DAEMON: 'false',
                    NX_CACHE_PROJECT_GRAPH: 'false',
                },
                stdio: ['ignore', 'pipe', 'pipe'],
            },
        )
        const project = JSON.parse(output)

        if (!project.root) {
            throw new Error(
                `Could not resolve root for Nx project "${projectName}"`,
            )
        }

        return project.root
    } catch {
        const packageDirectories = ['apps', 'packages']

        for (const baseDirectory of packageDirectories) {
            const absoluteBaseDirectory = path.resolve(baseDirectory)
            let entries = []

            try {
                entries = readdirSync(absoluteBaseDirectory, {
                    withFileTypes: true,
                })
            } catch {
                continue
            }

            for (const entry of entries) {
                if (!entry.isDirectory()) {
                    continue
                }

                const packageRoot = path.join(baseDirectory, entry.name)
                const packageJsonPath = path.join(packageRoot, 'package.json')

                try {
                    const packageJson = JSON.parse(
                        readFileSync(packageJsonPath, 'utf8'),
                    )

                    if (packageJson.name === projectName) {
                        return packageRoot
                    }
                } catch {
                    continue
                }
            }
        }
    }

    throw new Error(`Could not resolve root for Nx project "${projectName}"`)
}

function shouldFail(diagnostics, failOn) {
    if (failOn === 'none') {
        return false
    }

    if (failOn === 'warning') {
        return diagnostics.length > 0
    }

    return diagnostics.some((diagnostic) => diagnostic.severity === 'error')
}

function getCommitSha() {
    if (process.env.GITHUB_SHA) {
        return process.env.GITHUB_SHA
    }

    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
}

const projectAlias = values.project.replace(/^@/, '').replace(/\//g, '-')
const reportDirectory = path.resolve(values['output-dir'])
const reportLogPath = path.join(
    reportDirectory,
    `react-doctor-report-${projectAlias}.log`,
)
const reportJsonPath = path.join(
    reportDirectory,
    `react-doctor-report-${projectAlias}.json`,
)
const projectRoot = getProjectRoot(values.project)
const projectPath = path.resolve(projectRoot)

await mkdir(reportDirectory, { recursive: true })

console.log(`Running React Doctor for ${values.project} (${projectPath})`)

const result = await diagnose(projectPath, {
    lint: true,
    deadCode: true,
})

const diagnostics = result.diagnostics ?? []
const errorCount = diagnostics.filter(
    (diagnostic) => diagnostic.severity === 'error',
).length
const warningCount = diagnostics.filter(
    (diagnostic) => diagnostic.severity === 'warning',
).length

const report = {
    commit: getCommitSha(),
    date: new Date().toISOString(),
    project: values.project,
    projectAlias,
    projectRoot,
    score: result.score ?? null,
    projectInfo: result.project ?? null,
    elapsedMilliseconds: result.elapsedMilliseconds ?? null,
    diagnostics,
    summary: {
        totalDiagnostics: diagnostics.length,
        errorCount,
        warningCount,
    },
}

const logLines = [
    `Project: ${values.project}`,
    `Project root: ${projectRoot}`,
    `Score: ${result.score ? `${result.score.score} (${result.score.label})` : 'unavailable'}`,
    `Diagnostics: ${diagnostics.length}`,
    `Errors: ${errorCount}`,
    `Warnings: ${warningCount}`,
]

await Promise.all([
    writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`),
    writeFile(reportLogPath, `${logLines.join('\n')}\n`),
])

console.log(logLines.join('\n'))
console.log(`React Doctor report: ${reportLogPath}`)
console.log(`React Doctor snapshot: ${reportJsonPath}`)

if (shouldFail(diagnostics, values['fail-on'])) {
    process.exit(1)
}
