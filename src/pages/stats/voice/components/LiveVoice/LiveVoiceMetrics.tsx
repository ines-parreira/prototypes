import React, { ComponentProps, useMemo } from 'react'

import { LiveCallQueueVoiceCall } from '@gorgias/api-queries'

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

export default function LiveVoiceMetrics({
    liveVoiceCalls,
    isLoadingVoiceCalls,
    cleanStatsFilters,
}: Props) {
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
    const missedInboundCallsCount = useVoiceCallCountMetric(
        filters,
        timezone,
        VoiceCallSegment.missedCalls,
    )
    const averageTalkTime = useAverageTalkTimeMetric(filters, timezone)

    const metricCards: ComponentProps<typeof LiveVoiceMetricCard>[] = [
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
            title: constants.MISSED_INBOUND_CALLS_METRIC_TITLE,
            hint: constants.MISSED_INBOUND_CALLS_METRIC_HINT,
            value: missedInboundCallsCount.data?.value,
            isLoading: missedInboundCallsCount.isFetching,
            metricName: VoiceMetric.QueueMissedInboundCalls,
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

    return (
        <DashboardSection>
            {metricCards.map((card) => (
                <DashboardGridCell size={CARD_SIZE} key={card.title}>
                    <LiveVoiceMetricCard {...card} />
                </DashboardGridCell>
            ))}
        </DashboardSection>
    )
}
