import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { createPlugin, defineConfig, execute } from '@gorgias/static-analysis'

import baseConfig from '../../sa.config'

const ROOT_DIR = path.resolve(__dirname, '../..')
const HELP_DESK_SRC_DIR = path.resolve(ROOT_DIR, 'apps/helpdesk/src')
const DEFAULT_REPORT_PATH = path.join(
    os.tmpdir(),
    'helpdesk-dead-code-report.json',
)

const RUNTIME_ENTRY_POINTS = [
    path.resolve(ROOT_DIR, 'apps/helpdesk/src/main/init/index.tsx'),
    path.resolve(ROOT_DIR, 'apps/helpdesk/src/main/serviceWorker/index.ts'),
    path.resolve(
        ROOT_DIR,
        'apps/helpdesk/src/services/socketManager/sharedWorker.ts',
    ),
]

const NON_RUNTIME_PATTERNS = [
    /(^|\/)__snapshots__(\/|$)/,
    /(^|\/)__tests__(\/|$)/,
    /(^|\/)tests(\/|$)/,
    /(^|\/)fixtures(\/|$)/,
    /(^|\/)mocks?(\/|$)/,
    /(^|\/)types(\/|$)/,
    /\/rest_api\/.*generated/,
    /\.(stories|story|spec|test)\.(t|j)sx?$/,
    /\.d\.ts$/,
]

const RESOLVABLE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.d.ts']

type RootReason = 'orphan' | 'non_runtime_only'

type DeadCodeRoot = {
    filePath: string
    reason: RootReason
    supportDependents: string[]
    subtreeSize: number
    subtreeFiles: string[]
}

type DeadCodeReport = {
    generatedAt: string
    entryPoints: string[]
    missingEntryPoints: string[]
    summary: {
        totalModules: number
        runtimeReachableModules: number
        unreachableAppModules: number
        rootCandidates: number
        skippedSupportOnlyHelpers: number
    }
    notes: string[]
    roots: DeadCodeRoot[]
}

function toRelative(filePath: string) {
    return path.relative(ROOT_DIR, filePath).replaceAll(path.sep, '/')
}

function isNonRuntimeSupportFile(filePath: string) {
    const relativeFilePath = toRelative(filePath)
    return NON_RUNTIME_PATTERNS.some((pattern) =>
        pattern.test(relativeFilePath),
    )
}

function getFileStem(filePath: string) {
    return path
        .basename(filePath)
        .replace(/\.(stories|story|spec|test)\.(t|j)sx?$/, '')
        .replace(/\.(t|j)sx?$/, '')
}

function getCompanionSupportStems(
    rootFilePath: string,
    subtreeFiles: string[],
) {
    const rootDir = path.dirname(rootFilePath)
    const stems = new Set<string>()
    const rootStem = getFileStem(rootFilePath)

    if (rootStem === 'index') {
        stems.add(path.basename(rootDir))
    } else {
        stems.add(rootStem)
    }

    for (const filePath of subtreeFiles) {
        if (path.dirname(filePath) !== rootDir) {
            continue
        }

        const stem = getFileStem(filePath)
        if (stem !== 'index') {
            stems.add(stem)
        }
    }

    return stems
}

function isCompanionSupportFile(
    supportFilePath: string,
    rootFilePath: string,
    subtreeFiles: string[],
) {
    const rootDir = path.dirname(rootFilePath)
    const companionStems = getCompanionSupportStems(rootFilePath, subtreeFiles)

    return (
        supportFilePath.startsWith(`${rootDir}${path.sep}`) &&
        companionStems.has(getFileStem(supportFilePath))
    )
}

function resolveLiteralModule(
    fromFilePath: string,
    specifier: string,
    allModulePaths: Set<string>,
) {
    const basePaths: string[] = []

    if (specifier.startsWith('.')) {
        basePaths.push(path.resolve(path.dirname(fromFilePath), specifier))
    } else if (
        !specifier.startsWith('@') &&
        !specifier.startsWith('node:') &&
        !specifier.startsWith('http')
    ) {
        basePaths.push(path.resolve(HELP_DESK_SRC_DIR, specifier))
    } else {
        return null
    }

    for (const basePath of basePaths) {
        const candidates = [
            basePath,
            ...RESOLVABLE_EXTENSIONS.map(
                (extension) => `${basePath}${extension}`,
            ),
            ...RESOLVABLE_EXTENSIONS.map((extension) =>
                path.join(basePath, `index${extension}`),
            ),
        ]

        for (const candidate of candidates) {
            if (allModulePaths.has(candidate)) {
                return candidate
            }
        }
    }

    return null
}

function getLiteralRuntimeImports(
    filePath: string,
    allModulePaths: Set<string>,
) {
    const content = fs.readFileSync(filePath, 'utf8')
    const literalSpecifiers = [
        ...content.matchAll(/\brequire\(\s*['"]([^'"]+)['"]\s*\)/g),
        ...content.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g),
    ].map((match) => match[1])

    return [...new Set(literalSpecifiers)]
        .map((specifier) =>
            resolveLiteralModule(filePath, specifier, allModulePaths),
        )
        .filter((resolvedPath): resolvedPath is string => resolvedPath !== null)
}

function getLiteralSupportImports(
    filePath: string,
    allModulePaths: Set<string>,
) {
    const content = fs.readFileSync(filePath, 'utf8')
    const literalSpecifiers = [
        ...content.matchAll(
            /\b(?:jest|vi)\.(?:mock|doMock|unstable_mockModule)\(\s*['"]([^'"]+)['"]/g,
        ),
    ].map((match) => match[1])

    return [...new Set(literalSpecifiers)]
        .map((specifier) =>
            resolveLiteralModule(filePath, specifier, allModulePaths),
        )
        .filter((resolvedPath): resolvedPath is string => resolvedPath !== null)
}

const deadCodePlugin = createPlugin<
    {
        entryPoints: string[]
        reportPath: string
    },
    DeadCodeReport
>({
    name: 'dead-code-plugin',
    apply: ({ ModuleGraph, entryPoints }) => {
        const allModules = ModuleGraph.getAllModules()
        const allModulePaths = new Set(
            allModules.map((module) => module.filePath),
        )

        const resolvedEntryPoints = entryPoints.filter((entryPoint) =>
            allModulePaths.has(entryPoint),
        )
        const missingEntryPoints = entryPoints.filter(
            (entryPoint) => !allModulePaths.has(entryPoint),
        )

        const runtimeReachableModules = new Set<string>()
        const stack = [...resolvedEntryPoints]

        while (stack.length > 0) {
            const currentFilePath = stack.pop()
            if (
                !currentFilePath ||
                runtimeReachableModules.has(currentFilePath)
            ) {
                continue
            }

            runtimeReachableModules.add(currentFilePath)

            for (const dependency of ModuleGraph.getDependencies(
                currentFilePath,
            )) {
                stack.push(dependency.filePath)
            }

            for (const dependency of getLiteralRuntimeImports(
                currentFilePath,
                allModulePaths,
            )) {
                stack.push(dependency)
            }
        }

        const unreachableAppModules = allModules
            .map((module) => module.filePath)
            .filter(
                (filePath) =>
                    !runtimeReachableModules.has(filePath) &&
                    !isNonRuntimeSupportFile(filePath),
            )

        const unreachableAppModuleSet = new Set(unreachableAppModules)
        const literalSupportDependents = new Map<string, Set<string>>()

        for (const module of allModules) {
            if (!isNonRuntimeSupportFile(module.filePath)) {
                continue
            }

            for (const dependency of getLiteralSupportImports(
                module.filePath,
                allModulePaths,
            )) {
                if (!literalSupportDependents.has(dependency)) {
                    literalSupportDependents.set(dependency, new Set())
                }

                literalSupportDependents.get(dependency)?.add(module.filePath)
            }
        }

        const getSupportDependents = (filePath: string) => {
            const dependents = new Set(
                ModuleGraph.getDependents(filePath)
                    .map((dependent) => dependent.filePath)
                    .filter(isNonRuntimeSupportFile),
            )

            for (const dependent of literalSupportDependents.get(filePath) ??
                []) {
                dependents.add(dependent)
            }

            return [...dependents]
        }

        const collectSupportDependentClosure = (rootFilePath: string) => {
            const supportDependents = new Set<string>()
            const stack = getSupportDependents(rootFilePath)

            while (stack.length > 0) {
                const currentFilePath = stack.pop()
                if (
                    !currentFilePath ||
                    supportDependents.has(currentFilePath) ||
                    !isNonRuntimeSupportFile(currentFilePath)
                ) {
                    continue
                }

                supportDependents.add(currentFilePath)

                for (const dependent of getSupportDependents(currentFilePath)) {
                    stack.push(dependent)
                }
            }

            return [...supportDependents].sort()
        }

        const collectSubtree = (rootFilePath: string) => {
            const subtree = new Set<string>()
            const subtreeStack = [rootFilePath]

            while (subtreeStack.length > 0) {
                const currentFilePath = subtreeStack.pop()
                if (
                    !currentFilePath ||
                    subtree.has(currentFilePath) ||
                    !unreachableAppModuleSet.has(currentFilePath)
                ) {
                    continue
                }

                subtree.add(currentFilePath)

                for (const dependency of ModuleGraph.getDependencies(
                    currentFilePath,
                )) {
                    subtreeStack.push(dependency.filePath)
                }
            }

            return [...subtree].sort()
        }

        const skippedSupportOnlyHelpers: string[] = []

        const roots = unreachableAppModules
            .filter((filePath) => {
                const appDependents = ModuleGraph.getDependents(
                    filePath,
                ).filter((dependent) =>
                    unreachableAppModuleSet.has(dependent.filePath),
                )

                return appDependents.length === 0
            })
            .flatMap((filePath) => {
                const subtreeFiles = collectSubtree(filePath)
                const supportDependents = collectSupportDependentClosure(
                    filePath,
                ).filter((dependentFilePath) =>
                    isCompanionSupportFile(
                        dependentFilePath,
                        filePath,
                        subtreeFiles,
                    ),
                )

                const hasSupportOnlyHelperDependents =
                    supportDependents.length === 0 &&
                    collectSupportDependentClosure(filePath).length > 0

                if (hasSupportOnlyHelperDependents) {
                    skippedSupportOnlyHelpers.push(toRelative(filePath))
                    return []
                }

                const relativeSubtreeFiles = subtreeFiles.map(toRelative)

                return [
                    {
                        filePath: toRelative(filePath),
                        reason:
                            supportDependents.length === 0
                                ? 'orphan'
                                : 'non_runtime_only',
                        supportDependents: supportDependents.map(toRelative),
                        subtreeSize: relativeSubtreeFiles.length,
                        subtreeFiles: relativeSubtreeFiles,
                    },
                ]
            })
            .sort((left, right) => {
                if (right.subtreeSize !== left.subtreeSize) {
                    return right.subtreeSize - left.subtreeSize
                }

                if (left.reason !== right.reason) {
                    return left.reason.localeCompare(right.reason)
                }

                return left.filePath.localeCompare(right.filePath)
            })

        return {
            generatedAt: new Date().toISOString(),
            entryPoints: resolvedEntryPoints.map(toRelative),
            missingEntryPoints: missingEntryPoints.map(toRelative),
            summary: {
                totalModules: allModules.length,
                runtimeReachableModules: runtimeReachableModules.size,
                unreachableAppModules: unreachableAppModules.length,
                rootCandidates: roots.length,
                skippedSupportOnlyHelpers: skippedSupportOnlyHelpers.length,
            },
            notes: [
                'This analysis only follows static imports resolved by @gorgias/static-analysis.',
                'Literal require(), import(), and common jest/vi mock specifiers are included, but other string-based registrations and framework conventions still need manual verification before deletion.',
                'non_runtime_only only applies when a companion test/story in the same dead subtree support closure still references the candidate.',
            ],
            roots,
        }
    },
    report: (report) => {
        const reportPath =
            process.env.DEAD_CODE_REPORT_PATH ?? DEFAULT_REPORT_PATH

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

        console.log(`Dead code report written to ${reportPath}`)
        console.log(`Runtime entry points: ${report.entryPoints.length}`)
        console.log(`Missing entry points: ${report.missingEntryPoints.length}`)
        console.log(`Total modules: ${report.summary.totalModules}`)
        console.log(
            `Runtime reachable modules: ${report.summary.runtimeReachableModules}`,
        )
        console.log(
            `Unreachable app modules: ${report.summary.unreachableAppModules}`,
        )
        console.log(`Root candidates: ${report.summary.rootCandidates}`)
        console.log(
            `Skipped support-only helpers: ${report.summary.skippedSupportOnlyHelpers}`,
        )

        if (report.roots.length === 0) {
            console.log('No dead code roots found with the current rules.')
            return
        }

        console.log('\nTop root candidates:')

        for (const candidate of report.roots.slice(0, 20)) {
            console.log(
                `- ${candidate.filePath} [${candidate.reason}] subtree=${candidate.subtreeSize} dependents=${candidate.supportDependents.length}`,
            )
            if (candidate.supportDependents.length > 0) {
                for (const dependent of candidate.supportDependents.slice(
                    0,
                    3,
                )) {
                    console.log(`  dependent: ${dependent}`)
                }
            }
        }
    },
})

async function main() {
    const config = defineConfig({
        moduleGraphOptions: baseConfig.moduleGraphOptions,
        plugins: [
            deadCodePlugin({
                entryPoints: RUNTIME_ENTRY_POINTS,
                reportPath:
                    process.env.DEAD_CODE_REPORT_PATH ?? DEFAULT_REPORT_PATH,
            }),
        ],
    })

    await execute(config)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
