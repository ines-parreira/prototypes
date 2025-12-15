import { TrendCard } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const AnalyticsAiAgentAutomationRateCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const trend = {
        isFetching: false,
        isError: false,
        data: {
            label: 'Automation rate',
            value: 28,
            prevValue: 27.5,
        },
    }

    return (
        <TrendCard
            trend={trend}
            metricFormat="percent"
            interpretAs="more-is-better"
            withBorder
            withFixedWidth={false}
            hint={{
                title: 'Automation rate',
                caption:
                    'The percentage of customer interactions fully handled by the AI Agent.',
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
