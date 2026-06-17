import { createPlugin } from '@gorgias/static-analysis'

import {
    createMetricsAccumulator,
    reportPluginMetrics,
} from '../lib/report.utils'
import type { PluginMetrics } from '../lib/types'

export const AS_CASTS_PLUGIN_NAME = 'as-casts'

export const asCastsPlugin = createPlugin<Record<never, never>, PluginMetrics>({
    name: `codebase-health/${AS_CASTS_PLUGIN_NAME}`,
    apply: ({ ModuleGraph, walk }) => {
        const metrics = createMetricsAccumulator(AS_CASTS_PLUGIN_NAME)

        for (const module of ModuleGraph.getAllModules()) {
            walk(module.parsedResult.program, {
                enter(node) {
                    if (node.type !== 'TSAsExpression') {
                        return
                    }

                    if (node.typeAnnotation.type === 'TSAnyKeyword') {
                        metrics.add(module.filePath, 'as-any')
                    } else if (
                        node.typeAnnotation.type === 'TSUnknownKeyword'
                    ) {
                        metrics.add(module.filePath, 'as-unknown')
                    }
                },
            })
        }

        return metrics.finish()
    },
    report: reportPluginMetrics,
})
