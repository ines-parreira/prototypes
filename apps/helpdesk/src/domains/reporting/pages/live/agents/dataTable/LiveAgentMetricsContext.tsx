import { createContext, useContext } from 'react'

import type { LiveAgentMetricCell } from 'domains/reporting/pages/live/agents/dataTable/types'

export type LiveAgentMetricsByUserId = Map<
    number,
    Partial<Record<string, LiveAgentMetricCell>>
>

type LiveAgentMetricsContextValue = {
    byUserId: LiveAgentMetricsByUserId
    /** The stats request is still loading, so metric cells render a skeleton. */
    isLoading: boolean
}

const EMPTY_METRICS: Partial<Record<string, LiveAgentMetricCell>> = {}

const LiveAgentMetricsContext = createContext<LiveAgentMetricsContextValue>({
    byUserId: new Map(),
    isLoading: false,
})

export const LiveAgentMetricsProvider = LiveAgentMetricsContext.Provider

/**
 * Per-page stats metrics are provided via context rather than baked into each
 * row, so the DataTable's `data` array stays referentially stable when the
 * page's metrics arrive — otherwise the table would reset to the first page on
 * every navigation.
 */
export function useLiveAgentMetrics(
    userId: number,
): Partial<Record<string, LiveAgentMetricCell>> {
    return (
        useContext(LiveAgentMetricsContext).byUserId.get(userId) ??
        EMPTY_METRICS
    )
}

/** Whether the per-agent stats are still loading (drives the metric cell skeletons). */
export function useLiveAgentMetricsLoading(): boolean {
    return useContext(LiveAgentMetricsContext).isLoading
}
