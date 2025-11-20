import { TrendCard } from '@repo/reporting'

import { useAutomationRateMetric } from '../hooks/useAutomationRateMetric'

export const AnalyticsOverviewAutomationRateCard = () => {
    const trend = useAutomationRateMetric()

    return (
        <TrendCard
            trend={trend}
            metricFormat="percent"
            interpretAs="more-is-better"
            withBorder
            withFixedWidth={false}
            hint={{
                title: 'Percentage of customer interactions resolved by AI Agent',
                link: 'https://help.gorgias.com',
                linkText: 'Learn more',
            }}
        />
    )
}
