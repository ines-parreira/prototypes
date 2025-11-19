import { AnalyticsMetricCard } from '../components/AnalyticsMetricCard/AnalyticsMetricCard'

export const AnalyticsOverviewAutomationRateCard = () => {
    const value = 0.32
    const trend = 2

    return (
        <AnalyticsMetricCard
            title="Overall automation rate"
            value={`${(value * 100).toFixed(0)}%`}
            trend={trend}
        />
    )
}
