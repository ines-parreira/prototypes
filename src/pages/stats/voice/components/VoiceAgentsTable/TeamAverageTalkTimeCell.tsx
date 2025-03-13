import React from 'react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import css from 'pages/stats/voice/components/VoiceAgentsTable/VoiceAgentsTable.less'
import { VOICE_METRIC_COLUMN_WIDTH } from 'pages/stats/voice/constants/voiceAgents'
import { useAverageTalkTimeMetric } from 'pages/stats/voice/hooks/agentMetrics'

const TeamAverageTalkTimeCell = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

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
