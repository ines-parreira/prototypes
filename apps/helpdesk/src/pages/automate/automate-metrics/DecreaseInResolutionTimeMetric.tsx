import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'

import { DECREASE_IN_RESOLUTION_TIME } from './constants'
import type { BaseAutomateMetricProps } from './types'
import { getTrendProps, toDuration } from './utils'

export const DECREASE_IN_RESOLUTION_TIME_TOOLTIP = {
    title: 'How much faster Gorgias AI Agent is helping your team resolve interactions, based on your average resolution time.',
    link: 'https://link.gorgias.com/ec5',
    linkText: 'How is it calculated?',
}

export const DecreaseInResolutionTimeMetric = ({
    trend: decreaseInResolutionTimeMetric,
    chartId,
    dashboard,
}: BaseAutomateMetricProps) => {
    return (
        <MetricCard
            title={DECREASE_IN_RESOLUTION_TIME}
            hint={DECREASE_IN_RESOLUTION_TIME_TOOLTIP}
            dashboard={dashboard}
            chartId={chartId}
            isLoading={decreaseInResolutionTimeMetric.isFetching}
        >
            <BigNumberMetric
                isLoading={decreaseInResolutionTimeMetric.isFetching}
                trendBadge={
                    <TrendBadge
                        {...getTrendProps(decreaseInResolutionTimeMetric)}
                    />
                }
            >
                {toDuration(decreaseInResolutionTimeMetric)}
            </BigNumberMetric>
        </MetricCard>
    )
}
