import { AnalyticsMetricCard } from '../components/AnalyticsMetricCard/AnalyticsMetricCard'

export const AnalyticsOverviewCostSavedCard = () => {
    const value = 2400
    const trend = 2

    return (
        <AnalyticsMetricCard
            title="Cost saved"
            value={`$${value.toLocaleString()}`}
            trend={trend}
        />
    )
}
