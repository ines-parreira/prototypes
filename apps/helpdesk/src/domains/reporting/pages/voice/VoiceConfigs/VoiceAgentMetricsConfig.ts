import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    connectedCallsListQueryFactory,
    voiceCallListQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import {
    declinedVoiceCallsPerAgentQueryFactory,
    transferredInboundVoiceCallsPerAgentQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceEventsByAgent'
import type { BuiltQuery, Context } from 'domains/reporting/models/scopes/scope'
import { voiceCallsCountAllDimensionsQueryFactoryV2 } from 'domains/reporting/models/scopes/voiceCalls'
import type { VoiceCallsContext } from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { DrillDownQueryFactory } from 'domains/reporting/pages/common/drill-down/types'
import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import { VoiceAgentsMetric } from 'domains/reporting/state/ui/stats/types'

export const VoiceAgentsMetricsConfig: Record<
    VoiceAgentsMetric,
    {
        showMetric: boolean
        domain: Domain.Voice
        drillDownQuery: DrillDownQueryFactory
        drillDownQueryV2?: (ctx: Context) => BuiltQuery
        title: string
    }
> = {
    [VoiceAgentsMetric.AgentTotalCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            voiceCallListQueryFactory(statsFilters, timezone),
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsCountAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
            ),
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
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsCountAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
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
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsCountAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
                VoiceCallSegment.inboundAnsweredCallsByAgent,
            ),
        title: '',
    },
    [VoiceAgentsMetric.AgentInboundTransferredCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            transferredInboundVoiceCallsPerAgentQueryFactory(
                statsFilters,
                timezone,
            ),

        title: '',
    },
    [VoiceAgentsMetric.AgentInboundDeclinedCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            declinedVoiceCallsPerAgentQueryFactory(statsFilters, timezone),
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
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsCountAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
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
