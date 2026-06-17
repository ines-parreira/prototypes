import { createPlugin } from '@gorgias/static-analysis'

import {
    createMetricsAccumulator,
    getImportEntryName,
    reportPluginMetrics,
    toRepoRelative,
} from '../lib/report.utils'
import type { PluginMetrics } from '../lib/types'

export const HANDWRITTEN_REACT_QUERY_PLUGIN_NAME = 'handwritten-react-query'

const REACT_QUERY_PACKAGE = '@tanstack/react-query'
const REACT_QUERY_HOOKS = new Set([
    'useQuery',
    'useQueries',
    'useInfiniteQuery',
    'useSuspenseQuery',
    'useSuspenseQueries',
    'useSuspenseInfiniteQuery',
    'useMutation',
])

// The shared query client infrastructure legitimately wraps react-query
const INFRASTRUCTURE_DIR = 'packages/api-resources/'

export const handwrittenReactQueryPlugin = createPlugin<
    Record<never, never>,
    PluginMetrics
>({
    name: `codebase-health/${HANDWRITTEN_REACT_QUERY_PLUGIN_NAME}`,
    apply: ({ ModuleGraph }) => {
        const metrics = createMetricsAccumulator(
            HANDWRITTEN_REACT_QUERY_PLUGIN_NAME,
        )

        for (const module of ModuleGraph.getAllModules()) {
            if (
                toRepoRelative(module.filePath).startsWith(INFRASTRUCTURE_DIR)
            ) {
                continue
            }

            for (const importDeclaration of module.imports) {
                if (importDeclaration.source !== REACT_QUERY_PACKAGE) {
                    continue
                }

                for (const entry of importDeclaration.entries) {
                    const importName = getImportEntryName(entry)

                    if (importName && REACT_QUERY_HOOKS.has(importName)) {
                        metrics.add(module.filePath, importName)
                    }
                }
            }
        }

        return metrics.finish()
    },
    report: reportPluginMetrics,
})
