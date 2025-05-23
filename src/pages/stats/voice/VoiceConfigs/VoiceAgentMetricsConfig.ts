import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import {
    connectedCallsListQueryFactory,
    voiceCallListQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import { StatsFilters } from 'models/stat/types'
import {
    Domain,
    DrillDownQueryFactory,
} from 'pages/stats/common/drill-down/types'
import { VoiceAgentsMetric } from 'state/ui/stats/types'

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
