import React from 'react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { User } from 'config/types/user'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { DrillDownModalTrigger } from 'pages/stats/DrillDownModalTrigger'
import { VOICE_METRIC_COLUMN_WIDTH } from 'pages/stats/voice/constants/voiceAgents'
import { useAverageTalkTimeMetricPerAgent } from 'pages/stats/voice/hooks/metricsPerDimension'
import { isSortingMetricLoading } from 'state/ui/stats/agentPerformanceSlice'
import { VoiceAgentsMetrics } from 'state/ui/stats/drillDownSlice'

import css from './VoiceAgentsTable.less'

type Props = {
    agent: User
    metricData: Omit<VoiceAgentsMetrics, 'perAgentId'>
}

const AverageTalkTimeCell = ({ agent, metricData }: Props) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const isMetricLoading = useAppSelector(isSortingMetricLoading)
    const { data, isFetching } = useAverageTalkTimeMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
        String(agent.id),
    )
    const metricValue = data?.value
    const isLoading = isFetching || isMetricLoading

    return (
        <BodyCell justifyContent={'right'} className={css.metricCell}>
            {isLoading ? (
                <Skeleton inline width={VOICE_METRIC_COLUMN_WIDTH} />
            ) : (
                <DrillDownModalTrigger
                    metricData={{
                        ...metricData,
                        perAgentId: agent.id,
                        title: `${metricData.title} | ${agent.name}`,
                    }}
                    enabled={!!metricValue}
                    highlighted
                >
                    {formatMetricValue(
                        metricValue,
                        'duration',
                        NOT_AVAILABLE_PLACEHOLDER,
                    )}
                </DrillDownModalTrigger>
            )}
        </BodyCell>
    )
}

export default AverageTalkTimeCell
