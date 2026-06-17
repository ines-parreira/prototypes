import { createPlugin } from '@gorgias/static-analysis'

import {
    createMetricsAccumulator,
    getImportEntryName,
    reportPluginMetrics,
    toRepoRelative,
} from '../lib/report.utils'
import type { PluginMetrics } from '../lib/types'

export const LEGACY_API_CLIENTS_PLUGIN_NAME = 'legacy-api-clients'

const AXIOS_CLIENT_PACKAGE = '@repo/api-resources'
const AXIOS_CLIENT_IMPORTS = new Set(['default', 'createClient'])
const REST_API_CLIENT_PATTERN =
    /rest_api\/(gorgias_chat_protected_api|help_center_api|migration_api|revenue_addon_api|ssp_api|workflows_api)(\/|$)/
const REST_API_INTERNAL_DIR = 'apps/helpdesk/src/rest_api/'

export const legacyApiClientsPlugin = createPlugin<
    Record<never, never>,
    PluginMetrics
>({
    name: `codebase-health/${LEGACY_API_CLIENTS_PLUGIN_NAME}`,
    apply: ({ ModuleGraph }) => {
        const metrics = createMetricsAccumulator(LEGACY_API_CLIENTS_PLUGIN_NAME)

        for (const module of ModuleGraph.getAllModules()) {
            const modulePath = toRepoRelative(module.filePath)
            const isRestApiInternal = modulePath.startsWith(
                REST_API_INTERNAL_DIR,
            )

            for (const importDeclaration of module.imports) {
                if (importDeclaration.source === AXIOS_CLIENT_PACKAGE) {
                    for (const entry of importDeclaration.entries) {
                        const importName = getImportEntryName(entry)

                        if (
                            importName &&
                            AXIOS_CLIENT_IMPORTS.has(importName)
                        ) {
                            metrics.add(
                                module.filePath,
                                `${AXIOS_CLIENT_PACKAGE}#client`,
                            )
                        }
                    }
                }

                if (isRestApiInternal) {
                    continue
                }

                const importTarget = toRepoRelative(
                    importDeclaration.filePath ?? importDeclaration.source,
                )
                const match = REST_API_CLIENT_PATTERN.exec(importTarget)

                if (match) {
                    metrics.add(
                        module.filePath,
                        `rest_api/${match[1]}`,
                        Math.max(1, importDeclaration.entries.length),
                    )
                }
            }
        }

        return metrics.finish()
    },
    report: reportPluginMetrics,
})
