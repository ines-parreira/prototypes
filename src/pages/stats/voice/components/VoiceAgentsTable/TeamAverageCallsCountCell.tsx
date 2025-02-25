import React from 'react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { VOICE_METRIC_COLUMN_WIDTH } from 'pages/stats/voice/constants/voiceAgents'
import { useTotalCallsMetric } from 'pages/stats/voice/hooks/agentMetrics'
import { useNewVoiceStatsFilters } from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'

import css from './VoiceAgentsTable.less'

type TeamAverageCallsCountCellProps = {
    agentsCount: number
    useMetric: typeof useTotalCallsMetric
}
const TeamAverageCallsCountCell = ({
    agentsCount,
    useMetric,
}: TeamAverageCallsCountCellProps) => {
    const { cleanStatsFilters, userTimezone } = useNewVoiceStatsFilters()

    const { data, isFetching } = useMetric(cleanStatsFilters, userTimezone)
    const metricValue = data?.value ? data.value / agentsCount : data?.value

    return (
        <BodyCell justifyContent={'right'} className={css.metricCell}>
            {isFetching ? (
                <Skeleton inline width={VOICE_METRIC_COLUMN_WIDTH} />
            ) : (
                formatMetricValue(
                    metricValue,
                    'decimal',
                    NOT_AVAILABLE_PLACEHOLDER,
                )
            )}
        </BodyCell>
    )
}

export default TeamAverageCallsCountCell
