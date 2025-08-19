import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import PerformanceTip from 'domains/reporting/pages/common/components/PerformanceTip'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'

import {
    AUTOMATED_INTERACTION_TOOLTIP,
    AUTOMATED_INTERACTIONS_LABEL,
} from './constants'
import { AutomateMetricProps } from './types'
import { getTrendProps } from './utils'

export const AutomatedInteractionsMetric = ({
    trend: automatedInteractionsTrend,
    showTips,
    chartId,
    dashboard,
    title,
}: AutomateMetricProps) => {
    return (
        <MetricCard
            isLoading={automatedInteractionsTrend.isFetching}
            title={title || AUTOMATED_INTERACTIONS_LABEL}
            hint={AUTOMATED_INTERACTION_TOOLTIP}
            dashboard={dashboard}
            chartId={chartId}
            tip={
                showTips && (
                    <PerformanceTip
                        showBenchmark={false}
                        canduId="interactions"
                    >
                        Check out our{' '}
                        <a
                            target="blank"
                            href="https://link.gorgias.com/aut-playbook"
                        >
                            {' '}
                            Automation Playbook
                        </a>{' '}
                        for tactical tips on how to use AI Agent to its full
                        potential. Visit
                        <a target="blank" href="/app/settings/billing">
                            {' '}
                            billing
                        </a>{' '}
                        to make sure your AI Agent plan is the right size for
                        you.
                    </PerformanceTip>
                )
            }
        >
            <BigNumberMetric
                isLoading={automatedInteractionsTrend.isFetching}
                trendBadge={
                    <TrendBadge
                        {...getTrendProps(automatedInteractionsTrend)}
                    />
                }
            >
                {formatMetricValue(automatedInteractionsTrend.data?.value)}
            </BigNumberMetric>
        </MetricCard>
    )
}
