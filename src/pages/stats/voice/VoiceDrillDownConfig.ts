import { useDrillDownData } from 'hooks/reporting/useDrillDownData'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import {
    connectedCallsListQueryFactory,
    liveDashboardConnectedCallsListQueryFactory,
    liveDashBoardVoiceCallListQueryFactory,
    liveDashboardWaitingTimeCallsListQueryFactory,
    voiceCallListQueryFactory,
    waitingTimeCallsListQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import { StatsFilters } from 'models/stat/types'
import { formatVoiceDrillDownRowData } from 'pages/stats/common/drill-down/DrillDownFormatters'
import {
    DomainConfig,
    DrillDownQueryFactory,
} from 'pages/stats/common/drill-down/DrillDownTableConfig'
import { Domain } from 'pages/stats/common/drill-down/types'
import VoiceCallDrillDownTableContent from 'pages/stats/voice/components/VoiceCallTable/VoiceCallDrillDownTableContent'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'
import { VoiceAgentsMetric, VoiceMetric } from 'state/ui/stats/types'

export const VoiceMetricsConfig: Record<
    VoiceMetric,
    {
        showMetric: boolean
        domain: Domain.Voice
        drillDownQuery: DrillDownQueryFactory
        title: string
    }
> = {
    [VoiceMetric.AverageWaitTime]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            waitingTimeCallsListQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.inboundCalls,
            ),
        title: '',
    },
    [VoiceMetric.AverageTalkTime]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            connectedCallsListQueryFactory(statsFilters, timezone),
        title: '',
    },
    [VoiceMetric.QueueAverageWaitTime]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashboardWaitingTimeCallsListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundCalls,
            ),
        title: '',
    },
    [VoiceMetric.QueueAverageTalkTime]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashboardConnectedCallsListQueryFactory(statsFilters),
        title: '',
    },
    [VoiceMetric.QueueInboundCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundCalls,
            ),
        title: '',
    },
    [VoiceMetric.QueueOutboundCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.outboundCalls,
            ),
        title: '',
    },
    [VoiceMetric.QueueInboundUnansweredCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundUnansweredCalls,
            ),
        title: '',
    },
    [VoiceMetric.QueueInboundMissedCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundMissedCalls,
            ),
        title: '',
    },
    [VoiceMetric.QueueInboundAbandonedCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundAbandonedCalls,
            ),
        title: '',
    },
}

export const VoiceAgentsMetricsConfig: Record<
    VoiceAgentsMetric,
    {
        showMetric: boolean
        domain: Domain.Voice
        drillDownQuery: DrillDownQueryFactory
        title: string
    }
> = {
    [VoiceAgentsMetric.AgentTotalCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            voiceCallListQueryFactory(statsFilters, timezone),
        title: '',
    },
    [VoiceAgentsMetric.AgentInboundMissedCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            voiceCallListQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.inboundUnansweredCallsByAgent,
            ),
        title: '',
    },
    [VoiceAgentsMetric.AgentInboundAnsweredCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            voiceCallListQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.inboundAnsweredCallsByAgent,
            ),
        title: '',
    },
    [VoiceAgentsMetric.AgentOutboundCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            voiceCallListQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.outboundCalls,
            ),
        title: '',
    },
    [VoiceAgentsMetric.AgentAverageTalkTime]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            connectedCallsListQueryFactory(statsFilters, timezone),
        title: '',
    },
}

export const useVoiceDrillDownHook = (metricData: DrillDownMetric) =>
    useDrillDownData(metricData, formatVoiceDrillDownRowData)

export const VoiceDrillDownConfig: DomainConfig<
    VoiceMetric | VoiceAgentsMetric
> = {
    drillDownHook: useVoiceDrillDownHook,
    tableComponent: VoiceCallDrillDownTableContent,
    infoBarObjectType: 'voice calls',
    isMetricDataDownloadable: false,
    modalTriggerTooltipText: 'Click to view calls',
    metricsConfig: { ...VoiceMetricsConfig, ...VoiceAgentsMetricsConfig },
}
