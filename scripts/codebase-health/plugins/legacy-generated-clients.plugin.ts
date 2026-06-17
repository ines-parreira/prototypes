import { createPlugin } from '@gorgias/static-analysis'

import {
    createMetricsAccumulator,
    reportPluginMetrics,
} from '../lib/report.utils'
import type { PluginMetrics } from '../lib/types'

export const LEGACY_GENERATED_CLIENTS_PLUGIN_NAME = 'legacy-generated-clients'

const LEGACY_GENERATED_CLIENT_PATTERN =
    /^@gorgias\/(copilot|convert|customer-segmentation|ecommerce-storage|helpdesk|help-center|knowledge-service|workflows)-client$/
const LEGACY_API_PACKAGES = new Set(['@gorgias/event-tracker-api'])

export const legacyGeneratedClientsPlugin = createPlugin<
    Record<never, never>,
    PluginMetrics
>({
    name: `codebase-health/${LEGACY_GENERATED_CLIENTS_PLUGIN_NAME}`,
    apply: ({ ModuleGraph }) => {
        const metrics = createMetricsAccumulator(
            LEGACY_GENERATED_CLIENTS_PLUGIN_NAME,
        )

        for (const module of ModuleGraph.getAllModules()) {
            for (const importDeclaration of module.imports) {
                const isLegacyClient =
                    LEGACY_GENERATED_CLIENT_PATTERN.test(
                        importDeclaration.source,
                    ) || LEGACY_API_PACKAGES.has(importDeclaration.source)

                if (isLegacyClient) {
                    metrics.add(
                        module.filePath,
                        importDeclaration.source,
                        Math.max(1, importDeclaration.entries.length),
                    )
                }
            }
        }

        return metrics.finish()
    },
    report: reportPluginMetrics,
})
