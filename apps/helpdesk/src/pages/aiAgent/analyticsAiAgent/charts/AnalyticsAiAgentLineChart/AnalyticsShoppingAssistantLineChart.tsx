import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useGmvInfluencedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { useGmvInfluenceOverTimeSeries } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries'

import { ShoppingAssistantLineChart } from '../../components/AiAgentLineChart/ShoppingAssistantLineChart'

export const AnalyticsShoppingAssistantLineChart = () => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const gmvTrend = useGmvInfluencedTrend(cleanStatsFilters, userTimezone)

    const gmvTimeSeries = useGmvInfluenceOverTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
    )

    return (
        <ShoppingAssistantLineChart
            gmvTrend={gmvTrend}
            gmvTimeSeries={gmvTimeSeries}
            granularity={granularity}
            filters={cleanStatsFilters}
        />
    )
}
