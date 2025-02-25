import React from 'react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { VOICE_METRIC_COLUMN_WIDTH } from 'pages/stats/voice/constants/voiceAgents'
import { useAverageTalkTimeMetric } from 'pages/stats/voice/hooks/agentMetrics'
import { useNewVoiceStatsFilters } from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'

import css from './VoiceAgentsTable.less'

const TeamAverageTalkTimeCell = () => {
    const { cleanStatsFilters, userTimezone } = useNewVoiceStatsFilters()

    const { data, isFetching } = useAverageTalkTimeMetric(
        cleanStatsFilters,
        userTimezone,
    )
    const metricValue = data?.value

    return (
        <BodyCell justifyContent={'right'} className={css.metricCell}>
            {isFetching ? (
                <Skeleton inline width={VOICE_METRIC_COLUMN_WIDTH} />
            ) : typeof metricValue === 'number' && metricValue < 1 ? (
                '<1s'
            ) : (
                formatMetricValue(
                    metricValue,
                    'duration',
                    NOT_AVAILABLE_PLACEHOLDER,
                )
            )}
        </BodyCell>
    )
}

export default TeamAverageTalkTimeCell
