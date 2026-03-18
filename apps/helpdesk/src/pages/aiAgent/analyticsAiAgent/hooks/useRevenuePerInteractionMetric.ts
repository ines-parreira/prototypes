import type { MetricTrend } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { revenuePerInteractionQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchGenericTrend,
    useGenericTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend'
import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import safeDivide from 'domains/reporting/pages/automate/aiSalesAgent/util/safeDivide'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

export const useRevenuePerInteractionMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const { cleanStatsFilters } = useStatsFilters()

    const stage = useGetNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_REVENUE_PER_INTERACTION,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const v1Trend = useGenericTrend(
        {
            gmvInfluenced: useGmvInfluencedTrend(statsFilters, userTimezone),
            totalNumberOfAgentSalesConverations:
                useTotalNumberOfSalesConversationsTrend(
                    statsFilters,
                    userTimezone,
                ),
        },
        ({ gmvInfluenced, totalNumberOfAgentSalesConverations }) =>
            safeDivide(gmvInfluenced, totalNumberOfAgentSalesConverations),
        !isV2,
    )

    const v2Trend = useStatsMetricTrend(
        revenuePerInteractionQueryV2Factory({
            filters: cleanStatsFilters,
            timezone: userTimezone,
        }),
        revenuePerInteractionQueryV2Factory({
            filters: {
                ...cleanStatsFilters,
                period: getPreviousPeriod(cleanStatsFilters.period),
            },
            timezone: userTimezone,
        }),
        isV2,
    )

    const { isFetching, isError, data } = isV2 ? v2Trend : v1Trend

    return {
        isFetching,
        isError,
        data: {
            label: 'Revenue per interaction',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}

export const fetchRevenuePerInteractionMetric = async (
    filters: StatsFilters,
    timezone: string,
) => {
    const stage = await getNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_REVENUE_PER_INTERACTION,
    )
    if (stage === 'live' || stage === 'complete') {
        return fetchStatsMetricTrend(
            revenuePerInteractionQueryV2Factory({ filters, timezone }),
            revenuePerInteractionQueryV2Factory({
                filters: {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            }),
        )
    }
    return fetchGenericTrend(
        {
            gmvInfluenced: fetchGmvInfluencedTrend(filters, timezone),
            totalNumberOfAgentSalesConverations:
                fetchTotalNumberOfSalesConversationsTrend(filters, timezone),
        },
        ({ gmvInfluenced, totalNumberOfAgentSalesConverations }) =>
            safeDivide(gmvInfluenced, totalNumberOfAgentSalesConverations),
    )
}
