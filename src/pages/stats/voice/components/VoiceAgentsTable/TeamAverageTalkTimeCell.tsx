import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {VOICE_METRIC_COLUMN_WIDTH} from 'pages/stats/voice/constants/voiceAgents'
import {useAverageTalkTimeMetric} from 'pages/stats/voice/hooks/agentMetrics'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'

import css from './VoiceAgentsTable.less'

const TeamAverageTalkTimeCell = () => {
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

    const {data, isFetching} = useAverageTalkTimeMetric(
        cleanStatsFilters,
        userTimezone
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
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </BodyCell>
    )
}

export default TeamAverageTalkTimeCell
