import { TrendCard } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const AnalyticsAiAgentDecreaseinFRTCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const trend = {
        isFetching: false,
        isError: false,
        data: {
            label: 'Decrease in first resolution time',
            value: 88740,
            prevValue: 87000,
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
                title: 'Decrease in first resolution time',
                caption:
                    'The reduction in median resolution time achieved by AI Agent, measured from the customer’s first message to the ticket’s final closure.',
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
