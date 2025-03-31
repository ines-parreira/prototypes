import { Skeleton } from '@gorgias/merchant-ui-kit'

import { User } from 'config/types/user'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import css from 'pages/stats/voice/components/VoiceAgentsTable/VoiceAgentsTable.less'
import { VOICE_METRIC_COLUMN_WIDTH } from 'pages/stats/voice/constants/voiceAgents'
import { useTotalCallsMetricPerAgent } from 'pages/stats/voice/hooks/metricsPerDimension'
import { isSortingMetricLoading } from 'state/ui/stats/agentPerformanceSlice'
import { VoiceAgentsMetrics } from 'state/ui/stats/drillDownSlice'

type Props = {
    agent: User
    useMetricPerAgent: typeof useTotalCallsMetricPerAgent
    metricData?: Omit<VoiceAgentsMetrics, 'perAgentId'>
    isDrillDownEnabled?: boolean
}

const CallsCountCell = ({
    agent,
    useMetricPerAgent,
    metricData,
    isDrillDownEnabled = true,
}: Props) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const isMetricLoading = useAppSelector(isSortingMetricLoading)
    const { data, isFetching } = useMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
        String(agent.id),
    )

    const metricValue = data?.value
    const isLoading = isFetching || isMetricLoading

    const formattedValue = formatMetricValue(
        metricValue,
        'decimal',
        NOT_AVAILABLE_PLACEHOLDER,
    )

    return (
        <BodyCell justifyContent={'right'} className={css.metricCell}>
            {isLoading ? (
                <Skeleton inline width={VOICE_METRIC_COLUMN_WIDTH} />
            ) : metricData ? (
                <DrillDownModalTrigger
                    metricData={{
                        ...metricData,
                        perAgentId: agent.id,
                        title: `${metricData.title} | ${agent.name}`,
                    }}
                    enabled={isDrillDownEnabled && !!metricValue}
                    highlighted
                >
                    {formattedValue}
                </DrillDownModalTrigger>
            ) : (
                formattedValue
            )}
        </BodyCell>
    )
}

export default CallsCountCell
