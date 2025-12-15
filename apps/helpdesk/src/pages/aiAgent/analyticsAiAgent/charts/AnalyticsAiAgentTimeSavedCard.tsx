import { TrendCard } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const AnalyticsAiAgentTimeSavedCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const trend = {
        isFetching: false,
        isError: false,
        data: {
            label: 'Time saved by agents',
            value: 20750,
            prevValue: 20400,
        },
    }

    return (
        <TrendCard
            trend={trend}
            metricFormat="duration"
            interpretAs="more-is-better"
            withBorder
            withFixedWidth={false}
            hint={{
                title: 'Time saved by agents',
                caption:
                    'The time agent would have spent resolver customer inquiries without AI Agent.',
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
