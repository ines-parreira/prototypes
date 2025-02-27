import { ComponentProps } from 'react'

import { LiveCallQueueVoiceCall } from '@gorgias/api-queries'

import { useMetric } from 'hooks/reporting/useMetric'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { voiceCallAverageWaitTimeQueryFactory } from 'models/reporting/queryFactories/voice/voiceCall'
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

export const getOldLiveVoiceMetricCards = (
    liveVoiceCalls: LiveCallQueueVoiceCall[],
    isLoadingVoiceCalls: boolean,
    filters: StatsFilters,
    timezone: string,
): MetricCardProps[] => [
    {
        title: constants.CALLS_IN_QUEUE_METRIC_TITLE,
        hint: constants.CALLS_IN_QUEUE_METRIC_HINT,
        fetchData: () => {
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
        },
        size: 4,
    },
    {
        title: constants.AVERAGE_WAIT_TIME_METRIC_TITLE,
        hint: constants.AVERAGE_WAIT_TIME_METRIC_HINT,
        fetchData: () =>
            useMetric(voiceCallAverageWaitTimeQueryFactory(filters, timezone)),
        metricValueFormat: 'duration',
        metricName: VoiceMetric.QueueAverageWaitTime,
        size: 4,
    },
    {
        title: constants.DEPRECATED_MISSED_INBOUND_CALLS_METRIC_TITLE,
        hint: constants.DEPRECATED_MISSED_INBOUND_CALLS_METRIC_HINT,
        fetchData: () =>
            useVoiceCallCountMetric(
                filters,
                timezone,
                VoiceCallSegment.missedCalls,
            ),
        metricName: VoiceMetric.DEPRECATED_QueueMissedInboundCalls,
        size: 4,
    },
    {
        title: constants.INBOUND_CALLS_METRIC_TITLE,
        hint: constants.INBOUND_CALLS_METRIC_HINT,
        fetchData: () =>
            useVoiceCallCountMetric(
                filters,
                timezone,
                VoiceCallSegment.inboundCalls,
            ),
        metricName: VoiceMetric.QueueInboundCalls,
        size: 4,
    },
    {
        title: constants.OUTBOUND_CALLS_METRIC_TITLE,
        hint: constants.OUTBOUND_CALLS_METRIC_HINT,
        fetchData: () =>
            useVoiceCallCountMetric(
                filters,
                timezone,
                VoiceCallSegment.outboundCalls,
            ),
        metricName: VoiceMetric.QueueOutboundCalls,
        size: 4,
    },
    {
        title: constants.AVERAGE_TALK_TIME_METRIC_TITLE,
        hint: constants.AVERAGE_TALK_TIME_METRIC_HINT,
        fetchData: () => useAverageTalkTimeMetric(filters, timezone),
        metricValueFormat: 'duration',
        metricName: VoiceMetric.QueueAverageTalkTime,
        size: 4,
    },
]

export const getLiveVoiceMetricCards = (
    liveVoiceCalls: LiveCallQueueVoiceCall[],
    isLoadingVoiceCalls: boolean,
    filters: StatsFilters,
    timezone: string,
): MetricCardProps[] => {
    const isFilteringByAgent = !isFilterEmpty(filters.agents)

    return [
        {
            title: constants.CALLS_IN_QUEUE_METRIC_TITLE,
            hint: constants.CALLS_IN_QUEUE_METRIC_HINT,
            fetchData: () => {
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
            },
            size: 4,
        },
        {
            title: constants.AVERAGE_WAIT_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_WAIT_TIME_METRIC_HINT,
            fetchData: () =>
                useMetric(
                    voiceCallAverageWaitTimeQueryFactory(filters, timezone),
                ),
            metricValueFormat: 'duration',
            metricName: VoiceMetric.QueueAverageWaitTime,
            size: 4,
        },
        {
            title: constants.AVERAGE_TALK_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_TALK_TIME_METRIC_HINT,
            fetchData: () => useAverageTalkTimeMetric(filters, timezone),
            metricValueFormat: 'duration',
            metricName: VoiceMetric.QueueAverageTalkTime,
            size: 4,
        },
        {
            title: constants.INBOUND_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_CALLS_METRIC_HINT,
            fetchData: () =>
                useVoiceCallCountMetric(
                    filters,
                    timezone,
                    VoiceCallSegment.inboundCalls,
                ),
            metricName: VoiceMetric.QueueInboundCalls,
            size: 6,
        },
        {
            title: constants.OUTBOUND_CALLS_METRIC_TITLE,
            hint: constants.OUTBOUND_CALLS_METRIC_HINT,
            fetchData: () =>
                useVoiceCallCountMetric(
                    filters,
                    timezone,
                    VoiceCallSegment.outboundCalls,
                ),
            metricName: VoiceMetric.QueueOutboundCalls,
            size: 6,
        },
        {
            title: constants.UNANSWERED_INBOUND_CALLS_METRIC_TITLE,
            hint: constants.UNANSWERED_INBOUND_CALLS_METRIC_HINT,
            fetchData: () =>
                useVoiceCallCountMetric(
                    filters,
                    timezone,
                    VoiceCallSegment.inboundUnansweredCalls,
                ),
            metricName: VoiceMetric.QueueInboundUnansweredCalls,
            size: 4,
        },
        {
            title: constants.INBOUND_MISSED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_MISSED_CALLS_METRIC_HINT,
            fetchData: () =>
                useVoiceCallCountMetric(
                    filters,
                    timezone,
                    VoiceCallSegment.inboundMissedCalls,
                ),
            metricName: VoiceMetric.QueueInboundMissedCalls,
            size: 4,
        },
        {
            title: constants.INBOUND_ABANDONED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_ABANDONED_CALLS_METRIC_HINT,
            fetchData: () =>
                useVoiceCallCountMetric(
                    filters,
                    timezone,
                    VoiceCallSegment.inboundAbandonedCalls,
                ),
            metricName: VoiceMetric.QueueInboundAbandonedCalls,
            shouldHide: isFilteringByAgent,
            size: 4,
        },
    ]
}
