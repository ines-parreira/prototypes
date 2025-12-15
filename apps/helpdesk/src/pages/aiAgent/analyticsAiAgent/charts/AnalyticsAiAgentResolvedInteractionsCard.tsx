import { TrendCard } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const AnalyticsAiAgentResolvedInteractionsCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const trend = {
        isFetching: false,
        isError: false,
        data: {
            label: 'Resolved interactions',
            value: 2300,
            prevValue: 2250,
        },
    }

    return (
        <TrendCard
            trend={trend}
            metricFormat="decimal"
            interpretAs="more-is-better"
            withBorder
            withFixedWidth={false}
            hint={{
                title: 'Resolved interactions',
                caption:
                    'The number of interactions handled by Shopping Assistant in which the customer left without asking to talk to a human agent.',
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
