import { AnalyticsMetricCard } from '../components/AnalyticsMetricCard/AnalyticsMetricCard'

export const AnalyticsOverviewTimeSavedCard = () => {
    const valueInSeconds = 19800
    const trend = 2

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return `${hours}h ${minutes}m`
    }

    return (
        <AnalyticsMetricCard
            title="Time saved by agents"
            value={formatDuration(valueInSeconds)}
            trend={trend}
        />
    )
}
