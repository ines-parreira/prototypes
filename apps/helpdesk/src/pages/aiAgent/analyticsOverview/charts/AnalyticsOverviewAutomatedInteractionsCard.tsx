import { AnalyticsMetricCard } from '../components/AnalyticsMetricCard/AnalyticsMetricCard'

export const AnalyticsOverviewAutomatedInteractionsCard = () => {
    const value = 4800
    const trend = -2

    return (
        <AnalyticsMetricCard
            title="Automated interactions"
            value={value.toLocaleString()}
            trend={trend}
        />
    )
}
