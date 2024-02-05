import React from 'react'

import {User} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {isSortingMetricLoading} from 'state/ui/stats/agentPerformanceSlice'
import {VOICE_METRIC_COLUMN_WIDTH} from 'pages/stats/voice/constants/voiceAgents'
import {useAverageTalkTimeMetricPerAgent} from 'pages/stats/voice/hooks/metricsPerDimension'

import css from './VoiceAgentsTable.less'

const AverageTalkTimeCell = ({agent}: {agent: User}) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const isMetricLoading = useAppSelector(isSortingMetricLoading)
    const {data, isFetching} = useAverageTalkTimeMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
        String(agent.id)
    )
    const metricValue = data?.value
    const isLoading = isFetching || isMetricLoading

    return (
        <BodyCell justifyContent={'right'} className={css.metricCell}>
            {isLoading ? (
                <Skeleton inline width={VOICE_METRIC_COLUMN_WIDTH} />
            ) : (
                formatMetricValue(
                    metricValue,
                    'duration',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </BodyCell>
    )
}

export default AverageTalkTimeCell
