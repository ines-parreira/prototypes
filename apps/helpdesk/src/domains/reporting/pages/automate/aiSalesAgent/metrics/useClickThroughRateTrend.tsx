import {
    getStatsTrendFetch,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { timesRecommendedQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import { aiSalesAgentUniqueClicksQueryFactoryV2 } from 'domains/reporting/models/scopes/convertCampaignEvents'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchGenericTrend,
    useGenericTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend'
import { safeDivide } from 'domains/reporting/pages/automate/aiSalesAgent/util/safeDivide'

export const useClickThroughRateTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useGenericTrend(
        {
            totalProductClicks: getStatsTrendHook(
                aiSalesAgentUniqueClicksQueryFactoryV2,
            )(filters, timezone),
            totalRecommendations: getStatsTrendHook(
                timesRecommendedQueryV2Factory,
            )(filters, timezone),
        },
        ({ totalProductClicks, totalRecommendations }) =>
            safeDivide(totalProductClicks, totalRecommendations),
    )

export const fetchClickThroughRateTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchGenericTrend(
        {
            totalProductClicks: getStatsTrendFetch(
                aiSalesAgentUniqueClicksQueryFactoryV2,
            )(filters, timezone),
            totalRecommendations: getStatsTrendFetch(
                timesRecommendedQueryV2Factory,
            )(filters, timezone),
        },
        ({ totalProductClicks, totalRecommendations }) =>
            safeDivide(totalProductClicks, totalRecommendations),
    )
