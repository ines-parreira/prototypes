import { TrendCard } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

import { useAutomationRateMetric } from '../hooks/useAutomationRateMetric'

export const AnalyticsOverviewAutomationRateCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
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
            actionMenu={
                chartId ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        dashboard={dashboard}
                        chartName={trend.data?.label}
                    />
                ) : undefined
            }
        />
    )
}
