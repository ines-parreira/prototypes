import { useState } from 'react'

import { useDeepEffect } from '@repo/hooks'
import type { MetricTrend } from '@repo/reporting'

import { getAIAgentAutomationRateUnfilteredDenominatorTrend } from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import {
    fetchAllAutomatedInteractions,
    fetchAllAutomatedInteractionsByAutoResponders,
    fetchBillableTicketsExcludingAIAgent,
    fetchTrendFromMultipleMetricsTrend,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { aiAgentAutomatedInteractionsQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import { aiAgentAutomatedInteractionsQueryV2Factory } from 'domains/reporting/models/scopes/automatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAIAgentAutomationRateTrend = (
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
        fetchAIAgentAutomationRateTrend(filters, timezone, aiAgentUserId).then(
            setData,
        )
    }, [filters, timezone, aiAgentUserId, enabled])

    return data
}

export const fetchAIAgentAutomationRateTrend = async (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    return Promise.all([
        fetchTrendFromMultipleMetricsTrend(
            filters,
            timezone,
            aiAgentAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            aiAgentAutomatedInteractionsQueryV2Factory,
            'automatedInteractions',
        ),
        fetchAllAutomatedInteractionsByAutoResponders(filters, timezone),
        fetchAllAutomatedInteractions(filters, timezone),
        fetchBillableTicketsExcludingAIAgent(filters, timezone, aiAgentUserId),
    ]).then(
        ([
            aiAgentAutomatedInteractions,
            allAutomatedInteractionsByAutoResponders,
            allAutomatedInteractions,
            billableTicketsExcludingAIAgent,
        ]) => {
            return getAIAgentAutomationRateUnfilteredDenominatorTrend({
                isFetching: false,
                isError:
                    aiAgentAutomatedInteractions.isError ||
                    allAutomatedInteractionsByAutoResponders.isError ||
                    allAutomatedInteractions.isError ||
                    billableTicketsExcludingAIAgent.isError,
                aiAgentAutomatedInteractions: aiAgentAutomatedInteractions.data,
                allAutomatedInteractions: allAutomatedInteractions.data,
                allAutomatedInteractionsByAutoResponders:
                    allAutomatedInteractionsByAutoResponders.data,
                billableTicketsCount: billableTicketsExcludingAIAgent.data,
            })
        },
    )
}
