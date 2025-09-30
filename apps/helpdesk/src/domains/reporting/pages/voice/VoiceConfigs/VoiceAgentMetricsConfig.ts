import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    connectedCallsListQueryFactory,
    voiceCallListQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import {
    declinedVoiceCallsPerAgentQueryFactory,
    transferredInboundVoiceCallsPerAgentQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceEventsByAgent'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    Domain,
    DrillDownQueryFactory,
} from 'domains/reporting/pages/common/drill-down/types'
import { VoiceAgentsMetric } from 'domains/reporting/state/ui/stats/types'

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
