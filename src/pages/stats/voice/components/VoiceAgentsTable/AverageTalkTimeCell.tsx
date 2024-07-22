import React from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'
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
import {VoiceAgentsMetrics} from 'state/ui/stats/drillDownSlice'
import {FeatureFlagKey} from 'config/featureFlags'

import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import css from './VoiceAgentsTable.less'

type Props = {
    agent: User
    metricData: Omit<VoiceAgentsMetrics, 'perAgentId'>
}

const AverageTalkTimeCell = ({agent, metricData}: Props) => {
    const isVoiceCallsDrillDownEnabled =
        useFlags()[FeatureFlagKey.VoiceCallsDrillDown]

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
                <DrillDownModalTrigger
                    metricData={{...metricData, perAgentId: agent.id}}
                    enabled={isVoiceCallsDrillDownEnabled && !!metricValue}
                >
                    {formatMetricValue(
                        metricValue,
                        'duration',
                        NOT_AVAILABLE_PLACEHOLDER
                    )}
                </DrillDownModalTrigger>
            )}
        </BodyCell>
    )
}

export default AverageTalkTimeCell
