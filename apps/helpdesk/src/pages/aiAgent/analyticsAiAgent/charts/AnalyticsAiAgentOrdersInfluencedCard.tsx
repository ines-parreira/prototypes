import { TrendCard } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const AnalyticsAiAgentOrdersInfluencedCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const trend = {
        isFetching: false,
        isError: false,
        data: {
            label: 'Orders influenced',
            value: 1029,
            prevValue: 1050,
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
                title: 'Orders influenced',
                caption:
                    'The number of orders placed within 3 days of a Shopping Assistant conversation without a direct handover.',
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
