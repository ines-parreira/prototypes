import { TrendCard } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

import { useTimeSavedMetric } from '../hooks/useTimeSavedMetric'

export const AnalyticsOverviewTimeSavedCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
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
