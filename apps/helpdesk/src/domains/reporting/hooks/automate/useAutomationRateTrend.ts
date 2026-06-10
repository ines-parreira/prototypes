import { useState } from 'react'

import type { MetricTrend } from '@repo/reporting'
import { useDeepEffect } from '@gorgias/toolkit-react'

import { getAutomationRateUnfilteredDenominatorTrend } from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import {
    fetchAllAutomatedInteractions,
    fetchAllAutomatedInteractionsByAutoResponders,
    fetchBillableTicketsExcludingAIAgent,
    fetchFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomationRateTrend = (
    filters: StatsFilters,
    timezone: string,
    enabled: boolean = true,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const [data, setData] = useState<MetricTrend>({
        isFetching: enabled,
        isError: false,
    })

    useDeepEffect(() => {
        if (!enabled) return
        setData((prev) => ({ ...prev, isFetching: true }))
        fetchAutomationRateTrend(filters, timezone, aiAgentUserId).then(setData)
    }, [filters, timezone, aiAgentUserId, enabled])

    return data
}

export const fetchAutomationRateTrend = async (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    // We don't support double-reads for this metric as the V1 implementation doesn't use a single Cube
    return Promise.all([
        fetchFilteredAutomatedInteractions(filters, timezone),
        fetchAllAutomatedInteractionsByAutoResponders(filters, timezone),
        fetchAllAutomatedInteractions(filters, timezone),
        fetchBillableTicketsExcludingAIAgent(filters, timezone, aiAgentUserId),
    ]).then(
        ([
            filteredAutomatedInteractions,
            allAutomatedInteractionsByAutoResponders,
            allAutomatedInteractions,
            billableTicketsExcludingAIAgent,
        ]) => {
            return getAutomationRateUnfilteredDenominatorTrend({
                isFetching: false,
                isError:
                    filteredAutomatedInteractions.isError ||
                    allAutomatedInteractionsByAutoResponders.isError ||
                    allAutomatedInteractions.isError ||
                    billableTicketsExcludingAIAgent.isError,
                filteredAutomatedInteractions:
                    filteredAutomatedInteractions.data,
                allAutomatedInteractions: allAutomatedInteractions.data,
                allAutomatedInteractionsByAutoResponders:
                    allAutomatedInteractionsByAutoResponders.data,
                billableTicketsCount: billableTicketsExcludingAIAgent.data,
            })
        },
    )
}
