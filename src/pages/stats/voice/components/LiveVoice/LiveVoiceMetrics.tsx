import React, { ComponentProps, useMemo } from 'react'

import { LiveCallQueueVoiceCall } from '@gorgias/api-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useMetric } from 'hooks/reporting/useMetric'
import useAppSelector from 'hooks/useAppSelector'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { voiceCallAverageWaitTimeQueryFactory } from 'models/reporting/queryFactories/voice/voiceCall'
import { StatsFiltersWithLogicalOperator } from 'models/stat/types'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import * as constants from 'pages/stats/voice/constants/liveVoice'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'
import { VoiceMetric } from 'state/ui/stats/types'

import { useAverageTalkTimeMetric } from '../../hooks/agentMetrics'
import { useVoiceCallCountMetric } from '../../hooks/useVoiceCallCountMetric'
import LiveVoiceMetricCard from './LiveVoiceMetricCard'
import { LiveVoiceStatusFilterOption } from './types'
import { filterLiveCallsByStatus, getLiveVoicePeriodFilter } from './utils'

const CARD_SIZE = 4

type Props = {
    liveVoiceCalls: LiveCallQueueVoiceCall[]
    isLoadingVoiceCalls: boolean
    cleanStatsFilters: StatsFiltersWithLogicalOperator
}

type MetricCardProps = ComponentProps<typeof LiveVoiceMetricCard> & {
    size: number
}

export default function LiveVoiceMetrics({
    liveVoiceCalls,
    isLoadingVoiceCalls,
    cleanStatsFilters,
}: Props) {
    const shouldShowNewUnansweredStatuses = useFlag(
        FeatureFlagKey.ShowNewUnansweredStatuses,
    )

    const {
        data: { timezone },
    } = useAppSelector(getBusinessHoursSettings) ?? {
        data: {
            timezone: 'UTC',
        },
    }

    const filters = useMemo(() => {
        return {
            ...cleanStatsFilters,
            period: getLiveVoicePeriodFilter(timezone),
        }
    }, [cleanStatsFilters, timezone])

    const averageWaitTime = useMetric(
        voiceCallAverageWaitTimeQueryFactory(filters, timezone),
    )
    const averageTalkTime = useAverageTalkTimeMetric(filters, timezone)
    const inboundCallsCount = useVoiceCallCountMetric(
        filters,
        timezone,
        VoiceCallSegment.inboundCalls,
    )
    const outboundCallsCount = useVoiceCallCountMetric(
        filters,
        timezone,
        VoiceCallSegment.outboundCalls,
    )
    const DEPRECATED_missedInboundCallsCount = useVoiceCallCountMetric(
        filters,
        timezone,
        VoiceCallSegment.missedCalls,
    )
    const inboundUnansweredCallsCount = useVoiceCallCountMetric(
        filters,
        timezone,
        VoiceCallSegment.inboundUnansweredCalls,
    )
    const inboundMissedCallsCount = useVoiceCallCountMetric(
        filters,
        timezone,
        VoiceCallSegment.inboundMissedCalls,
    )
    const inboundAbandonedCallsCount = useVoiceCallCountMetric(
        filters,
        timezone,
        VoiceCallSegment.inboundAbandonedCalls,
    )

    const oldMetricCards: ComponentProps<typeof LiveVoiceMetricCard>[] = [
        {
            title: constants.CALLS_IN_QUEUE_METRIC_TITLE,
            hint: constants.CALLS_IN_QUEUE_METRIC_HINT,
            value: filterLiveCallsByStatus(
                liveVoiceCalls,
                LiveVoiceStatusFilterOption.IN_QUEUE,
            ).length,
            isLoading: isLoadingVoiceCalls,
        },
        {
            title: constants.AVERAGE_WAIT_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_WAIT_TIME_METRIC_HINT,
            metricValueFormat: 'duration',
            value: averageWaitTime.data?.value,
            isLoading: averageWaitTime.isFetching,
            metricName: VoiceMetric.QueueAverageWaitTime,
        },
        {
            title: constants.DEPRECATED_MISSED_INBOUND_CALLS_METRIC_TITLE,
            hint: constants.DEPRECATED_MISSED_INBOUND_CALLS_METRIC_HINT,
            value: DEPRECATED_missedInboundCallsCount.data?.value,
            isLoading: DEPRECATED_missedInboundCallsCount.isFetching,
            metricName: VoiceMetric.DEPRECATED_QueueMissedInboundCalls,
        },
        {
            title: constants.INBOUND_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_CALLS_METRIC_HINT,
            value: inboundCallsCount.data?.value,
            isLoading: inboundCallsCount.isFetching,
            metricName: VoiceMetric.QueueInboundCalls,
        },
        {
            title: constants.OUTBOUND_CALLS_METRIC_TITLE,
            hint: constants.OUTBOUND_CALLS_METRIC_HINT,
            value: outboundCallsCount.data?.value,
            isLoading: outboundCallsCount.isFetching,
            metricName: VoiceMetric.QueueOutboundCalls,
        },
        {
            title: constants.AVERAGE_TALK_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_TALK_TIME_METRIC_HINT,
            metricValueFormat: 'duration',
            value: averageTalkTime.data?.value,
            isLoading: averageTalkTime.isFetching,
            metricName: VoiceMetric.QueueAverageTalkTime,
        },
    ]

    const metricCards: MetricCardProps[] = [
        {
            title: constants.CALLS_IN_QUEUE_METRIC_TITLE,
            hint: constants.CALLS_IN_QUEUE_METRIC_HINT,
            value: filterLiveCallsByStatus(
                liveVoiceCalls,
                LiveVoiceStatusFilterOption.IN_QUEUE,
            ).length,
            isLoading: isLoadingVoiceCalls,
            size: 4,
        },
        {
            title: constants.AVERAGE_WAIT_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_WAIT_TIME_METRIC_HINT,
            metricValueFormat: 'duration',
            value: averageWaitTime.data?.value,
            isLoading: averageWaitTime.isFetching,
            metricName: VoiceMetric.QueueAverageWaitTime,
            size: 4,
        },
        {
            title: constants.AVERAGE_TALK_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_TALK_TIME_METRIC_HINT,
            metricValueFormat: 'duration',
            value: averageTalkTime.data?.value,
            isLoading: averageTalkTime.isFetching,
            metricName: VoiceMetric.QueueAverageTalkTime,
            size: 4,
        },
        {
            title: constants.INBOUND_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_CALLS_METRIC_HINT,
            value: inboundCallsCount.data?.value,
            isLoading: inboundCallsCount.isFetching,
            metricName: VoiceMetric.QueueInboundCalls,
            size: 6,
        },
        {
            title: constants.OUTBOUND_CALLS_METRIC_TITLE,
            hint: constants.OUTBOUND_CALLS_METRIC_HINT,
            value: outboundCallsCount.data?.value,
            isLoading: outboundCallsCount.isFetching,
            metricName: VoiceMetric.QueueOutboundCalls,
            size: 6,
        },
        {
            title: constants.UNANSWERED_INBOUND_CALLS_METRIC_TITLE,
            hint: constants.UNANSWERED_INBOUND_CALLS_METRIC_HINT,
            value: inboundUnansweredCallsCount.data?.value,
            isLoading: inboundUnansweredCallsCount.isFetching,
            metricName: VoiceMetric.QueueInboundUnansweredCalls,
            size: 4,
        },
        {
            title: constants.INBOUND_MISSED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_MISSED_CALLS_METRIC_HINT,
            value: inboundMissedCallsCount.data?.value,
            isLoading: inboundMissedCallsCount.isFetching,
            metricName: VoiceMetric.QueueInboundMissedCalls,
            size: 4,
        },
        {
            title: constants.INBOUND_ABANDONED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_ABANDONED_CALLS_METRIC_HINT,
            value: inboundAbandonedCallsCount.data?.value,
            isLoading: inboundAbandonedCallsCount.isFetching,
            metricName: VoiceMetric.QueueInboundAbandonedCalls,
            size: 4,
        },
    ]

    return (
        <DashboardSection>
            {!shouldShowNewUnansweredStatuses &&
                oldMetricCards.map((card) => (
                    <DashboardGridCell size={CARD_SIZE} key={card.title}>
                        <LiveVoiceMetricCard {...card} />
                    </DashboardGridCell>
                ))}
            {shouldShowNewUnansweredStatuses &&
                metricCards.map((card) => (
                    <DashboardGridCell size={card.size} key={card.title}>
                        <LiveVoiceMetricCard {...card} />
                    </DashboardGridCell>
                ))}
        </DashboardSection>
    )
}
