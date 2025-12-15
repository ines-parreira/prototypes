import type { ComponentProps } from 'react'

import type { LiveCallQueueVoiceCall } from '@gorgias/helpdesk-queries'

import { useSummaryMetric } from 'domains/reporting/hooks/useSummaryMetric'
import { VoiceCallSummaryMeasure } from 'domains/reporting/models/cubes/VoiceCallSummaryCube'
import { liveVoiceCallSummaryQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCallSummary'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { isFilterEmpty } from 'domains/reporting/pages/utils'
import type { LiveVoiceMetricCard } from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceMetricCard'
import { LiveVoiceStatusFilterOption } from 'domains/reporting/pages/voice/components/LiveVoice/types'
import {
    filterLiveCallsByStatus,
    getLiveVoicePeriodFilter,
} from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import * as constants from 'domains/reporting/pages/voice/constants/liveVoice'
import { VoiceMetric } from 'domains/reporting/state/ui/stats/types'

import { getAccountBusinessHoursTimezone } from '../../../../models/queryFactories/voice/voiceCall'
import { voiceCallsSummaryMetricsQueryFactoryV2 } from '../../../../models/scopes/voiceCallsSummary'

type MetricCardProps = ComponentProps<typeof LiveVoiceMetricCard> & {
    size: number
}

export default function useLiveVoiceMetricCards(
    liveVoiceCalls: LiveCallQueueVoiceCall[],
    isLoadingVoiceCalls: boolean,
    filters: StatsFilters,
): MetricCardProps[] {
    const isFilteringByAgent = !isFilterEmpty(filters.agents)

    const liveInQueueVoiceCallListMetric = {
        data: filterLiveCallsByStatus(
            liveVoiceCalls,
            LiveVoiceStatusFilterOption.IN_QUEUE,
        ).length,
        isFetching: isLoadingVoiceCalls,
        isError: false,
    }

    const summaryMetric = useSummaryMetric(
        liveVoiceCallSummaryQueryFactory(filters),
        voiceCallsSummaryMetricsQueryFactoryV2({
            filters: {
                ...filters,
                period: getLiveVoicePeriodFilter(
                    getAccountBusinessHoursTimezone(),
                ),
            },
            timezone: getAccountBusinessHoursTimezone(),
        }),
        true,
        30 * 1000,
    )

    return [
        {
            title: constants.CALLS_IN_QUEUE_METRIC_TITLE,
            hint: constants.CALLS_IN_QUEUE_METRIC_HINT,
            metric: liveInQueueVoiceCallListMetric,
            size: 4,
        },
        {
            title: constants.AVERAGE_WAIT_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_WAIT_TIME_METRIC_HINT,
            metric: summaryMetric,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryAverageWaitTime,
            metricValueFormat: 'duration',
            metricName: VoiceMetric.QueueAverageWaitTime,
            size: 4,
        },
        {
            title: constants.AVERAGE_TALK_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_TALK_TIME_METRIC_HINT,
            metric: summaryMetric,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryAverageTalkTime,
            metricValueFormat: 'duration',
            metricName: VoiceMetric.QueueAverageTalkTime,
            size: 4,
        },
        {
            title: constants.INBOUND_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_CALLS_METRIC_HINT,
            metric: summaryMetric,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryInboundTotal,
            metricName: VoiceMetric.QueueInboundCalls,
            size: 4,
        },
        {
            title: constants.OUTBOUND_CALLS_METRIC_TITLE,
            hint: constants.OUTBOUND_CALLS_METRIC_HINT,
            metric: summaryMetric,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryOutboundTotal,
            metricName: VoiceMetric.QueueOutboundCalls,
            size: 4,
        },
        {
            title: constants.UNANSWERED_INBOUND_CALLS_METRIC_TITLE,
            hint: constants.UNANSWERED_INBOUND_CALLS_METRIC_HINT,
            metric: summaryMetric,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryUnansweredTotal,
            metricName: VoiceMetric.QueueInboundUnansweredCalls,
            size: 4,
        },
        {
            title: constants.INBOUND_MISSED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_MISSED_CALLS_METRIC_HINT,
            metric: summaryMetric,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryMissedTotal,
            metricName: VoiceMetric.QueueInboundMissedCalls,
            showPercentage: true,
            size: 3,
        },
        {
            title: constants.INBOUND_CANCELLED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_CANCELLED_CALLS_METRIC_HINT,
            metric: summaryMetric,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryCancelledTotal,
            metricName: VoiceMetric.QueueInboundCancelledCalls,
            shouldHide: isFilteringByAgent,
            showPercentage: true,
            size: 3,
        },
        {
            title: constants.INBOUND_ABANDONED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_ABANDONED_CALLS_METRIC_HINT,
            metric: summaryMetric,
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryAbandonedTotal,
            metricName: VoiceMetric.QueueInboundAbandonedCalls,
            shouldHide: isFilteringByAgent,
            showPercentage: true,
            size: 3,
        },
        {
            title: constants.INBOUND_CALLBACK_REQUESTED_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_CALLBACK_REQUESTED_CALLS_METRIC_HINT,
            metric: summaryMetric,
            measure:
                VoiceCallSummaryMeasure.VoiceCallSummaryCallbackRequestedTotal,
            metricName: VoiceMetric.QueueInboundCallbackRequestedCalls,
            shouldHide: isFilteringByAgent,
            showPercentage: true,
            size: 3,
        },
    ]
}
