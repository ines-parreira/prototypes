import {
    defineConfig,
    deprecationPlugin,
    execute,
} from '@gorgias/static-analysis'

import { deprecatedPackages } from '../lib/deprecated-packages'
import { moduleGraphRuns } from '../lib/module-graph-runs'
import {
    mergePluginMetrics,
    toRepoRelative,
    writeMetricsFile,
} from '../lib/report.utils'
import type { PluginMetrics } from '../lib/types'
import {
    ANY_TYPES_PLUGIN_NAME,
    anyTypesPlugin,
} from '../plugins/any-types.plugin'
import { AS_CASTS_PLUGIN_NAME, asCastsPlugin } from '../plugins/as-casts.plugin'
import {
    DEPRECATED_COMPONENTS_PLUGIN_NAME,
    deprecatedComponentsPlugin,
} from '../plugins/deprecated-components.plugin'
import {
    HANDWRITTEN_REACT_QUERY_PLUGIN_NAME,
    handwrittenReactQueryPlugin,
} from '../plugins/handwritten-react-query.plugin'
import {
    LEGACY_API_CLIENTS_PLUGIN_NAME,
    legacyApiClientsPlugin,
} from '../plugins/legacy-api-clients.plugin'
import {
    LEGACY_GENERATED_CLIENTS_PLUGIN_NAME,
    legacyGeneratedClientsPlugin,
} from '../plugins/legacy-generated-clients.plugin'

type DeprecationResults = Parameters<
    NonNullable<Parameters<typeof deprecationPlugin>[0]['report']>
>[0]

const customPlugins = [
    { name: ANY_TYPES_PLUGIN_NAME, factory: anyTypesPlugin },
    { name: AS_CASTS_PLUGIN_NAME, factory: asCastsPlugin },
    {
        name: DEPRECATED_COMPONENTS_PLUGIN_NAME,
        factory: deprecatedComponentsPlugin,
    },
    { name: LEGACY_API_CLIENTS_PLUGIN_NAME, factory: legacyApiClientsPlugin },
    {
        name: HANDWRITTEN_REACT_QUERY_PLUGIN_NAME,
        factory: handwrittenReactQueryPlugin,
    },
    {
        name: LEGACY_GENERATED_CLIENTS_PLUGIN_NAME,
        factory: legacyGeneratedClientsPlugin,
    },
]

function compareStrings(left: string, right: string) {
    if (left < right) {
        return -1
    }

    return left > right ? 1 : 0
}

function normalizeDeprecationRuns(runs: DeprecationResults[]) {
    const deprecatedNodes = runs
        .flatMap((run) => run.deprecated)
        .map((node) => ({
            filePath: toRepoRelative(node.filePath),
            nodeType: node.nodeType,
            nodeName: node.nodeName ?? null,
            count: node.count,
            usages: node.usages
                .map((usage) => ({
                    name: usage.name,
                    files: usage.files.map(toRepoRelative).sort(),
                }))
                .sort((left, right) => compareStrings(left.name, right.name)),
        }))
        .sort(
            (left, right) =>
                compareStrings(left.filePath, right.filePath) ||
                compareStrings(left.nodeName ?? '', right.nodeName ?? ''),
        )

    const packageUsages = new Map<string, Map<string, Set<string>>>()

    for (const run of runs) {
        for (const packageUsage of run.deprecatedPackageUsages) {
            const usagesByName =
                packageUsages.get(packageUsage.packageName) ??
                new Map<string, Set<string>>()

            for (const usage of packageUsage.usages) {
                const files = usagesByName.get(usage.name) ?? new Set<string>()

                for (const file of usage.files) {
                    files.add(toRepoRelative(file))
                }

                usagesByName.set(usage.name, files)
            }

            packageUsages.set(packageUsage.packageName, usagesByName)
        }
    }

    const deprecatedPackageUsages = [...packageUsages.entries()]
        .map(([packageName, usagesByName]) => {
            const usages = [...usagesByName.entries()]
                .map(([name, files]) => ({
                    name,
                    count: files.size,
                    files: [...files].sort(),
                }))
                .sort((left, right) => compareStrings(left.name, right.name))

            return {
                packageName,
                count: usages.reduce((sum, usage) => sum + usage.count, 0),
                usages,
            }
        })
        .sort((left, right) =>
            compareStrings(left.packageName, right.packageName),
        )

    return {
        plugin: 'deprecated-nodes',
        summary: {
            deprecatedNodes: deprecatedNodes.length,
            deprecatedNodeUsages: deprecatedNodes.reduce(
                (sum, node) => sum + node.count,
                0,
            ),
            deprecatedPackageUsages: deprecatedPackageUsages.reduce(
                (sum, packageUsage) => sum + packageUsage.count,
                0,
            ),
        },
        deprecated: deprecatedNodes,
        deprecatedPackageUsages,
    }
}

export async function runStaticAnalysis() {
    const collectedMetrics = new Map<string, PluginMetrics[]>()
    const deprecationRuns: DeprecationResults[] = []

    const collect = (metrics: PluginMetrics) => {
        const runs = collectedMetrics.get(metrics.plugin) ?? []
        runs.push(metrics)
        collectedMetrics.set(metrics.plugin, runs)
    }

    for (const run of moduleGraphRuns) {
        console.log(`Building "${run.name}" module graph…`)

        await execute(
            defineConfig({
                moduleGraphOptions: run.options,
                plugins: [
                    ...customPlugins.map(({ factory }) =>
                        factory({ report: collect }),
                    ),
                    deprecationPlugin({
                        deprecatedPackages,
                        report: (results) => deprecationRuns.push(results),
                    }),
                ],
            }),
        )
    }

    const headlines: string[] = []

    for (const { name } of customPlugins) {
        const merged = mergePluginMetrics(
            name,
            collectedMetrics.get(name) ?? [],
        )

        writeMetricsFile(`plugin-${name}.json`, merged)
        headlines.push(`${name}=${merged.summary.total}`)
    }

    const deprecatedNodes = normalizeDeprecationRuns(deprecationRuns)
    writeMetricsFile('plugin-deprecated-nodes.json', deprecatedNodes)
    headlines.push(
        `deprecated-nodes=${deprecatedNodes.summary.deprecatedNodeUsages}`,
    )

    return headlines.join(', ')
}
