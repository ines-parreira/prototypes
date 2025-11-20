import { TrendCard } from '@repo/reporting'

import { useTimeSavedMetric } from '../hooks/useTimeSavedMetric'

export const AnalyticsOverviewTimeSavedCard = () => {
    const trend = useTimeSavedMetric()

    return (
        <TrendCard
            trend={trend}
            metricFormat="duration"
            interpretAs="more-is-better"
            withBorder
            withFixedWidth={false}
            hint={{
                title: 'Total time saved by agents through AI automation',
                link: 'https://help.gorgias.com',
                linkText: 'Learn more',
            }}
        />
    )
}
