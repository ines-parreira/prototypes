import { TrendCard } from '@repo/reporting'

import { useAutomatedInteractionsMetric } from '../hooks/useAutomatedInteractionsMetric'

export const AnalyticsOverviewAutomatedInteractionsCard = () => {
    const trend = useAutomatedInteractionsMetric()

    return (
        <TrendCard
            trend={trend}
            metricFormat="decimal"
            interpretAs="more-is-better"
            withBorder
            withFixedWidth={false}
        />
    )
}
