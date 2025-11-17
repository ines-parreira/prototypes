import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'

import { DECREASE_IN_FIRST_RESPONSE } from './constants'
import type { BaseAutomateMetricProps } from './types'
import { getTrendProps, toDuration } from './utils'

export const DECREASE_IN_FIRST_RESPONSE_TOOLTIP = {
    title: 'How much longer customers would have had to wait for a first response if you were not using Gorgias AI Agent, based on your average first response time.',
    link: 'https://link.gorgias.com/mal',
    linkText: 'How is it calculated?',
}

export const DecreaseInFirstResponseTimeMetric = ({
    trend: firstResponseTimeTrend,
    chartId,
    dashboard,
}: BaseAutomateMetricProps) => {
    return (
        <MetricCard
            title={DECREASE_IN_FIRST_RESPONSE}
            hint={DECREASE_IN_FIRST_RESPONSE_TOOLTIP}
            dashboard={dashboard}
            chartId={chartId}
            isLoading={firstResponseTimeTrend.isFetching}
        >
            <BigNumberMetric
                isLoading={firstResponseTimeTrend.isFetching}
                trendBadge={
                    <TrendBadge {...getTrendProps(firstResponseTimeTrend)} />
                }
            >
                {toDuration(firstResponseTimeTrend)}
            </BigNumberMetric>
        </MetricCard>
    )
}
