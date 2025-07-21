import { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

import { TIME_SAVED_BY_AGENTS } from './constants'
import { getTrendProps, toDuration } from './utils'

type Props = {
    timeSavedByAgentsTrend: MetricTrend
} & DashboardChartProps

export const TIME_SAVED_BY_AGENTS_TOOLTIP = {
    title: 'How much time agents would have spent resolving customer inquiries without Gorgias AI Agent.',
    link: 'https://link.gorgias.com/jax',
    linkText: 'How is it calculated?',
}

export const TimeSavedByAgentsMetric: React.FC<Props> = ({
    timeSavedByAgentsTrend,
    chartId,
    dashboard,
}) => {
    return (
        <MetricCard
            title={TIME_SAVED_BY_AGENTS}
            hint={TIME_SAVED_BY_AGENTS_TOOLTIP}
            isLoading={timeSavedByAgentsTrend.isFetching}
            dashboard={dashboard}
            chartId={chartId}
        >
            <BigNumberMetric
                isLoading={timeSavedByAgentsTrend.isFetching}
                trendBadge={
                    <TrendBadge {...getTrendProps(timeSavedByAgentsTrend)} />
                }
            >
                {toDuration(timeSavedByAgentsTrend)}
            </BigNumberMetric>
        </MetricCard>
    )
}
