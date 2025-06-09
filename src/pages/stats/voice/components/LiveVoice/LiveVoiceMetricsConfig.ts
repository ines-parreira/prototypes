import { ComponentProps } from 'react'

import { LiveCallQueueVoiceCall } from '@gorgias/helpdesk-queries'

import { useMetric } from 'hooks/reporting/useMetric'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import {
    voiceCallAverageWaitTimeQueryFactory,
    voiceCallCountQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import { StatsFilters } from 'models/stat/types'
import { isFilterEmpty } from 'pages/stats/utils'
import * as constants from 'pages/stats/voice/constants/liveVoice'
import { VoiceMetric } from 'state/ui/stats/types'

import { useAverageTalkTimeMetric } from '../../hooks/agentMetrics'
import { useVoiceCallCountMetric } from '../../hooks/useVoiceCallCountMetric'
import { LiveVoiceMetricCard } from './LiveVoiceMetricCard'
import { LiveVoiceStatusFilterOption } from './types'
import { filterLiveCallsByStatus } from './utils'

type MetricCardProps = ComponentProps<typeof LiveVoiceMetricCard> & {
    size: number
}

export const getLiveVoiceMetricCards = (
    liveVoiceCalls: LiveCallQueueVoiceCall[],
    isLoadingVoiceCalls: boolean,
    filters: StatsFilters,
    timezone: string,
    isCallbackRequestsEnabled: boolean = false,
): MetricCardProps[] => {
    const isFilteringByAgent = !isFilterEmpty(filters.agents)

    const useLiveInQueueVoiceCallList = () => {
        return {
            data: {
                value: filterLiveCallsByStatus(
                    liveVoiceCalls,
                    LiveVoiceStatusFilterOption.IN_QUEUE,
                ).length,
            },
            isFetching: isLoadingVoiceCalls,
            isError: false,
        }
    }
    const useLiveAverageWaitTimeMetric = () =>
        useMetric(voiceCallAverageWaitTimeQueryFactory(filters, timezone, true))
    const useLiveAverageTalkTimeMetric = () =>
        useAverageTalkTimeMetric(filters, timezone, true)
    const useLiveInboundCallsCountMetric = () =>
        useVoiceCallCountMetric(
            filters,
            timezone,
            VoiceCallSegment.inboundCalls,
            true,
        )
    const useLiveOutboundCallsCountMetric = () =>
        useVoiceCallCountMetric(
            filters,
            timezone,
            VoiceCallSegment.outboundCalls,
            true,
        )
    const useLiveInboundUnansweredCallsCountMetric = () =>
        useVoiceCallCountMetric(
            filters,
            timezone,
            VoiceCallSegment.inboundUnansweredCalls,
            true,
        )
    const useLiveInboundMissedCallsCountMetric = () =>
        useVoiceCallCountMetric(
            filters,
            timezone,
            VoiceCallSegment.inboundMissedCalls,
            true,
        )
    const useLiveInboundAbandonedCallsCountMetric = () =>
        useVoiceCallCountMetric(
            filters,
            timezone,
            VoiceCallSegment.inboundAbandonedCalls,
            true,
        )
    const useLiveInboundCancelledCallsCountMetric = () =>
        useVoiceCallCountMetric(
            filters,
            timezone,
            VoiceCallSegment.inboundCancelledCalls,
            true,
        )
    const useLiveInboundCallbackRequestedCallsCountMetric = () =>
        useVoiceCallCountMetric(
            filters,
            timezone,
            VoiceCallSegment.inboundCallbackRequestedCalls,
            true,
        )

    const totalInboundCallsQueryFactory = voiceCallCountQueryFactory(
        filters,
        timezone,
        VoiceCallSegment.inboundCalls,
    )

    if (!isCallbackRequestsEnabled) {
        return [
            {
                title: constants.CALLS_IN_QUEUE_METRIC_TITLE,
                hint: constants.CALLS_IN_QUEUE_METRIC_HINT,
                fetchData: useLiveInQueueVoiceCallList,
                size: 4,
            },
            {
                title: constants.AVERAGE_WAIT_TIME_METRIC_TITLE,
                hint: constants.AVERAGE_WAIT_TIME_METRIC_HINT,
                fetchData: useLiveAverageWaitTimeMetric,
                metricValueFormat: 'duration',
                metricName: VoiceMetric.QueueAverageWaitTime,
                size: 4,
            },
            {
                title: constants.AVERAGE_TALK_TIME_METRIC_TITLE,
                hint: constants.AVERAGE_TALK_TIME_METRIC_HINT,
                fetchData: useLiveAverageTalkTimeMetric,
                metricValueFormat: 'duration',
                metricName: VoiceMetric.QueueAverageTalkTime,
                size: 4,
            },
            {
                title: constants.INBOUND_CALLS_METRIC_TITLE,
                hint: constants.INBOUND_CALLS_METRIC_HINT,
                fetchData: useLiveInboundCallsCountMetric,
                metricName: VoiceMetric.QueueInboundCalls,
                size: 6,
            },
            {
                title: constants.OUTBOUND_CALLS_METRIC_TITLE,
                hint: constants.OUTBOUND_CALLS_METRIC_HINT,
                fetchData: useLiveOutboundCallsCountMetric,
                metricName: VoiceMetric.QueueOutboundCalls,
                size: 6,
            },
            {
                title: constants.UNANSWERED_INBOUND_CALLS_METRIC_TITLE,
                hint: constants.UNANSWERED_INBOUND_CALLS_METRIC_HINT,
                fetchData: useLiveInboundUnansweredCallsCountMetric,
                metricName: VoiceMetric.QueueInboundUnansweredCalls,
                size: 4,
            },
            {
                title: constants.INBOUND_MISSED_CALLS_METRIC_TITLE,
                hint: constants.INBOUND_MISSED_CALLS_METRIC_HINT,
                fetchData: useLiveInboundMissedCallsCountMetric,
                metricName: VoiceMetric.QueueInboundMissedCalls,
                showPercentage: true,
                totalCallsQueryFactory: totalInboundCallsQueryFactory,
                size: 4,
            },
            {
                title: constants.INBOUND_ABANDONED_CALLS_METRIC_TITLE,
                hint: constants.INBOUND_ABANDONED_CALLS_METRIC_HINT,
                fetchData: useLiveInboundAbandonedCallsCountMetric,
                metricName: VoiceMetric.QueueInboundAbandonedCalls,
                shouldHide: isFilteringByAgent,
                showPercentage: true,
                totalCallsQueryFactory: totalInboundCallsQueryFactory,
                size: 4,
            },
        ]
    }

    return [
        {
            title: constants.CALLS_IN_QUEUE_METRIC_TITLE,
            hint: constants.CALLS_IN_QUEUE_METRIC_HINT,
            fetchData: useLiveInQueueVoiceCallList,
            size: 4,
        },
        {
            title: constants.AVERAGE_WAIT_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_WAIT_TIME_METRIC_HINT,
            fetchData: useLiveAverageWaitTimeMetric,
            metricValueFormat: 'duration',
            metricName: VoiceMetric.QueueAverageWaitTime,
            size: 4,
        },
        {
            title: constants.AVERAGE_TALK_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_TALK_TIME_METRIC_HINT,
            fetchData: useLiveAverageTalkTimeMetric,
            metricValueFormat: 'duration',
            metricName: VoiceMetric.QueueAverageTalkTime,
            size: 4,
        },
        {
            title: constants.INBOUND_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_CALLS_METRIC_HINT,
            fetchData: useLiveInboundCallsCountMetric,
            metricName: VoiceMetric.QueueInboundCalls,
            size: 4,
        },
        {
            title: constants.OUTBOUND_CALLS_METRIC_TITLE,
            hint: constants.OUTBOUND_CALLS_METRIC_HINT,
            fetchData: useLiveOutboundCallsCountMetric,
            metricName: VoiceMetric.QueueOutboundCalls,
            size: 4,
        },
        {
            title: constants.UNANSWERED_INBOUND_CALLS_METRIC_TITLE,
            hint: constants.UNANSWERED_INBOUND_CALLS_METRIC_HINT,
            fetchData: useLiveInboundUnansweredCallsCountMetric,
            metricName: VoiceMetric.QueueInboundUnansweredCalls,
            size: 4,
        },
        {
            title: constants.INBOUND_MISSED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_MISSED_CALLS_METRIC_HINT,
            fetchData: useLiveInboundMissedCallsCountMetric,
            metricName: VoiceMetric.QueueInboundMissedCalls,
            showPercentage: true,
            totalCallsQueryFactory: totalInboundCallsQueryFactory,
            size: 3,
        },
        {
            title: constants.INBOUND_CANCELLED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_CANCELLED_CALLS_METRIC_HINT,
            fetchData: useLiveInboundCancelledCallsCountMetric,
            metricName: VoiceMetric.QueueInboundCancelledCalls,
            shouldHide: isFilteringByAgent,
            showPercentage: true,
            totalCallsQueryFactory: totalInboundCallsQueryFactory,
            size: 3,
        },
        {
            title: constants.INBOUND_ABANDONED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_ABANDONED_CALLS_METRIC_HINT,
            fetchData: useLiveInboundAbandonedCallsCountMetric,
            metricName: VoiceMetric.QueueInboundAbandonedCalls,
            shouldHide: isFilteringByAgent,
            showPercentage: true,
            totalCallsQueryFactory: totalInboundCallsQueryFactory,
            size: 3,
        },
        {
            title: constants.INBOUND_CALLBACK_REQUESTED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_CALLBACK_REQUESTED_CALLS_METRIC_HINT,
            fetchData: useLiveInboundCallbackRequestedCallsCountMetric,
            metricName: VoiceMetric.QueueInboundCallbackRequestedCalls,
            shouldHide: isFilteringByAgent,
            showPercentage: true,
            totalCallsQueryFactory: totalInboundCallsQueryFactory,
            size: 3,
        },
    ]
}
