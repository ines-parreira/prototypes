import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {User} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import {VOICE_METRIC_COLUMN_WIDTH} from 'pages/stats/voice/constants/voiceAgents'
import {useTotalCallsMetricPerAgent} from 'pages/stats/voice/hooks/metricsPerDimension'
import {isSortingMetricLoading} from 'state/ui/stats/agentPerformanceSlice'
import {VoiceAgentsMetrics} from 'state/ui/stats/drillDownSlice'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'

import css from './VoiceAgentsTable.less'

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
    const isVoiceAgentsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFiltersVoice]

    const {cleanStatsFilters: legacyStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {cleanStatsFilters: statsFiltersWithLogicalOperators, userTimezone} =
        useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const cleanStatsFilters = isVoiceAgentsNewFilters
        ? statsFiltersWithLogicalOperators
        : legacyStatsFilters

    const isMetricLoading = useAppSelector(isSortingMetricLoading)
    const {data, isFetching} = useMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
        String(agent.id)
    )

    const metricValue = data?.value
    const isLoading = isFetching || isMetricLoading

    const formattedValue = formatMetricValue(
        metricValue,
        'decimal',
        NOT_AVAILABLE_PLACEHOLDER
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
                    useNewFilterData={isVoiceAgentsNewFilters}
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
