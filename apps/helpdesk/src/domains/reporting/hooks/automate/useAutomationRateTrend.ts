import { useState } from 'react'

import { useDeepEffect } from '@repo/hooks'

import { getAutomationRateUnfilteredDenominatorTrend } from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import {
    fetchAllAutomatedInteractions,
    fetchAllAutomatedInteractionsByAutoResponders,
    fetchBillableTicketsExcludingAIAgent,
    fetchFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { fetchStatsMetricTrend } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    overallAutomationRate,
    overallAutomationRateQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAutomationRateTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const [data, setData] = useState<MetricTrend>({
        isFetching: true,
        isError: false,
    })

    useDeepEffect(() => {
        setData((prev) => ({ ...prev, isFetching: true }))
        fetchAutomationRateTrend(filters, timezone, aiAgentUserId).then(setData)
    }, [filters, timezone, aiAgentUserId])

    return data
}

export const fetchAutomationRateTrend = async (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    // We don't support double-reads for this metric as the V1 implementation doesn't use a single Cube
    const stage = await getNewStatsFeatureFlagMigration(
        overallAutomationRate.name,
    )
    if (stage === 'live' || stage === 'complete') {
        return fetchStatsMetricTrend(
            overallAutomationRateQueryFactoryV2({
                filters,
                timezone,
            }),
            overallAutomationRateQueryFactoryV2({
                filters: {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            }),
        )
    }

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
