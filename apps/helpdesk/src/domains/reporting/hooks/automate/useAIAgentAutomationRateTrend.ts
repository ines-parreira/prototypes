import { useState } from 'react'

import { useDeepEffect } from '@repo/hooks'

import { getAIAgentAutomationRateUnfilteredDenominatorTrend } from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import {
    fetchAllAutomatedInteractions,
    fetchAllAutomatedInteractionsByAutoResponders,
    fetchBillableTicketsExcludingAIAgent,
    fetchTrendFromMultipleMetricsTrend,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { fetchStatsMetricTrend } from 'domains/reporting/hooks/useStatsMetricTrend'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { aiAgentAutomatedInteractionsQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import { aiAgentAutomatedInteractionsQueryV2Factory } from 'domains/reporting/models/scopes/automatedInteractions'
import {
    aiAgentAutomationRate,
    aiAgentAutomationRateQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAIAgentAutomationRateTrend = (
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
        fetchAIAgentAutomationRateTrend(filters, timezone, aiAgentUserId).then(
            setData,
        )
    }, [filters, timezone, aiAgentUserId])

    return data
}

export const fetchAIAgentAutomationRateTrend = async (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    // We don't support double-reads for this metric as the V1 implementation doesn't use a single Cube
    const stage = await getNewStatsFeatureFlagMigration(
        aiAgentAutomationRate.name,
    )
    if (stage === 'live' || stage === 'complete') {
        return fetchStatsMetricTrend(
            aiAgentAutomationRateQueryFactoryV2({
                filters,
                timezone,
            }),
            aiAgentAutomationRateQueryFactoryV2({
                filters: {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            }),
        )
    }

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
