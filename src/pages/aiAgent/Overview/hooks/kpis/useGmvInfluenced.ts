import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import { gmvInfluencedQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters, StatType } from 'models/stat/types'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'
import { KpiMetric } from 'pages/aiAgent/Overview/types'
import { getPreviousPeriod } from 'utils/reporting'

export const useGmvInfluenced = (
    filters: StatsFilters,
    timezone: string,
): KpiMetric => {
    const hasAnalytics =
        useFlags()[FeatureFlagKey.StandaloneAiSalesAnalyticsPage]

    const { currency } = useCurrency()

    const result = useMetricTrend(
        gmvInfluencedQueryFactory(filters, timezone),
        gmvInfluencedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

    return {
        hidden: !hasAnalytics,
        title: 'GMV Influenced',
        hint: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
        metricType: StatType.Currency,
        isLoading: result.isFetching,
        currency,
        'data-candu-id': 'ai-agent-overview-kpi-gmv-influenced',
        ...result.data,
    }
}
