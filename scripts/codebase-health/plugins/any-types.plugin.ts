import { createPlugin } from '@gorgias/static-analysis'

import {
    createMetricsAccumulator,
    reportPluginMetrics,
} from '../lib/report.utils'
import type { PluginMetrics } from '../lib/types'

export const ANY_TYPES_PLUGIN_NAME = 'any-types'

/**
 * Counts every `any` type keyword across the codebase by walking each
 * module's AST for `TSAnyKeyword` nodes. This captures all forms — type
 * annotations (`x: any`), type arguments (`Array<any>`), function return
 * types, `as any` casts and so on — giving the total `any` footprint, a
 * superset of the `as any` casts tracked by the as-casts plugin.
 */
export const anyTypesPlugin = createPlugin<Record<never, never>, PluginMetrics>(
    {
        name: `codebase-health/${ANY_TYPES_PLUGIN_NAME}`,
        apply: ({ ModuleGraph, walk }) => {
            const metrics = createMetricsAccumulator(ANY_TYPES_PLUGIN_NAME)

            for (const module of ModuleGraph.getAllModules()) {
                walk(module.parsedResult.program, {
                    enter(node) {
                        if (node.type === 'TSAnyKeyword') {
                            metrics.add(module.filePath, 'any')
                        }
                    },
                })
            }

            return metrics.finish()
        },
        report: reportPluginMetrics,
    },
)
