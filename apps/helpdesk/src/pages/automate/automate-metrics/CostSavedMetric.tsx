import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { formatCurrency } from 'domains/reporting/pages/common/utils'

import { COST_SAVED } from './constants'
import { BaseAutomateMetricProps } from './types'
import { getTrendProps } from './utils'

export const COST_SAVED_TOOLTIP = {
    title: 'How much more it would have cost if these interactions were handled by an agent, based on Helpdesk ticket cost plus the benchmark agent cost of $3.1 per ticket.',
    link: 'https://link.gorgias.com/cge',
    linkText: 'How is it calculated?',
}

export const CostSavedMetric = ({
    trend: costSavedTrend,
    dashboard,
    chartId,
}: BaseAutomateMetricProps) => {
    return (
        <MetricCard
            title={COST_SAVED}
            hint={COST_SAVED_TOOLTIP}
            dashboard={dashboard}
            chartId={chartId}
            isLoading={costSavedTrend.isFetching}
        >
            <BigNumberMetric
                isLoading={costSavedTrend.isFetching}
                trendBadge={<TrendBadge {...getTrendProps(costSavedTrend)} />}
            >
                {formatCurrency(
                    Math.round(costSavedTrend.data?.value ?? 0),
                    'usd',
                )}
            </BigNumberMetric>
        </MetricCard>
    )
}
