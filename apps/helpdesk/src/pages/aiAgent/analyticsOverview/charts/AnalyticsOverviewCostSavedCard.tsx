import { TrendCard } from '@repo/reporting'

import { useCostSavedMetric } from '../hooks/useCostSavedMetric'

export const AnalyticsOverviewCostSavedCard = () => {
    const trend = useCostSavedMetric()

    return (
        <TrendCard
            trend={trend}
            metricFormat="currency-precision-1"
            interpretAs="more-is-better"
            withBorder
            withFixedWidth={false}
        />
    )
}
