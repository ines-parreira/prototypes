import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useGmvInfluencedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { useGmvInfluenceOverTimeSeries } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries'

import { ShoppingAssistantLineChart } from '../../components/AiAgentLineChart/ShoppingAssistantLineChart'

export const AnalyticsShoppingAssistantLineChart = () => {
    const { statsFilters, userTimezone, granularity } = useAutomateFilters()

    const gmvTrend = useGmvInfluencedTrend(statsFilters, userTimezone)

    const gmvTimeSeries = useGmvInfluenceOverTimeSeries(
        statsFilters,
        userTimezone,
        granularity,
    )

    return (
        <ShoppingAssistantLineChart
            gmvTrend={gmvTrend}
            gmvTimeSeries={gmvTimeSeries}
            granularity={granularity}
            filters={statsFilters}
        />
    )
}
