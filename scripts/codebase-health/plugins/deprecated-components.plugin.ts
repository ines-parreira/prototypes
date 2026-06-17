import { createPlugin } from '@gorgias/static-analysis'

import { deprecatedPackages } from '../lib/deprecated-packages'
import {
    createMetricsAccumulator,
    getImportEntryName,
    reportPluginMetrics,
} from '../lib/report.utils'
import type { PluginMetrics } from '../lib/types'

export const DEPRECATED_COMPONENTS_PLUGIN_NAME = 'deprecated-components'

const deprecatedImportsByPackage = new Map(
    deprecatedPackages.map((deprecatedPackage) => [
        deprecatedPackage.name,
        new Set(deprecatedPackage.imports),
    ]),
)

export const deprecatedComponentsPlugin = createPlugin<
    Record<never, never>,
    PluginMetrics
>({
    name: `codebase-health/${DEPRECATED_COMPONENTS_PLUGIN_NAME}`,
    apply: ({ ModuleGraph }) => {
        const metrics = createMetricsAccumulator(
            DEPRECATED_COMPONENTS_PLUGIN_NAME,
        )

        for (const module of ModuleGraph.getAllModules()) {
            for (const importDeclaration of module.imports) {
                const deprecatedImports = deprecatedImportsByPackage.get(
                    importDeclaration.source,
                )

                if (!deprecatedImports) {
                    continue
                }

                for (const entry of importDeclaration.entries) {
                    const importName = getImportEntryName(entry)

                    if (importName && deprecatedImports.has(importName)) {
                        metrics.add(
                            module.filePath,
                            `${importDeclaration.source}#${importName}`,
                        )
                    }
                }
            }
        }

        return metrics.finish()
    },
    report: reportPluginMetrics,
})
