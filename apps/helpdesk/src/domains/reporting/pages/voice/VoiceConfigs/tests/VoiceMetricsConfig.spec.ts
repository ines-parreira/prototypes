import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    connectedCallsListQueryFactory,
    liveDashboardConnectedCallsListQueryFactory,
    liveDashBoardVoiceCallListQueryFactory,
    liveDashboardWaitingTimeCallsListQueryFactory,
    voiceCallListQueryFactory,
    voiceCallListWithSlaStatusQueryFactory,
    waitingTimeCallsListQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import {
    declinedVoiceCallsPerAgentQueryFactory,
    transferredInboundVoiceCallsPerAgentQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceEventsByAgent'
import {
    declinedCallsPerAgentQueryV2Factory,
    transferredInboundVoiceCallsPerAgentQueryV2Factory,
} from 'domains/reporting/models/scopes/voiceAgentEvents'
import {
    voiceCallsCountAllDimensionsQueryFactoryV2,
    voiceCallsLiveDashboardConnectedAllDimensionsQueryFactoryV2,
    voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2,
    voiceCallsWithSlaStatusAllDimensionsQueryFactoryV2,
    voiceConnectedAllDimensionsQueryFactoryV2,
    voiceLiveDashboardWaitTimeCallsAllDimensionsQueryFactoryV2,
    voiceWaitTimeCallsAllDimensionsQueryFactoryV2,
} from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { VoiceAgentsMetricsConfig } from 'domains/reporting/pages/voice/VoiceConfigs/VoiceAgentMetricsConfig'
import { VoiceMetricsConfig } from 'domains/reporting/pages/voice/VoiceConfigs/VoiceMetricsConfig'
import {
    VoiceAgentsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'

jest.mock('domains/reporting/models/queryFactories/voice/voiceCall', () => ({
    waitingTimeCallsListQueryFactory: jest.fn(),
    connectedCallsListQueryFactory: jest.fn(),
    liveDashboardWaitingTimeCallsListQueryFactory: jest.fn(),
    liveDashboardConnectedCallsListQueryFactory: jest.fn(),
    liveDashBoardVoiceCallListQueryFactory: jest.fn(),
    voiceCallListQueryFactory: jest.fn(),
    voiceCallListWithSlaStatusQueryFactory: jest.fn(),
}))

jest.mock(
    'domains/reporting/models/queryFactories/voice/voiceEventsByAgent',
    () => ({
        declinedVoiceCallsPerAgentQueryFactory: jest.fn(),
        transferredInboundVoiceCallsPerAgentQueryFactory: jest.fn(),
    }),
)

jest.mock('domains/reporting/models/scopes/voiceAgentEvents', () => ({
    declinedCallsPerAgentQueryV2Factory: jest.fn(),
    transferredInboundVoiceCallsPerAgentQueryV2Factory: jest.fn(),
}))

jest.mock('domains/reporting/models/scopes/voiceCalls', () => ({
    voiceCallsCountAllDimensionsQueryFactoryV2: jest.fn(),
    voiceCallsLiveDashboardConnectedAllDimensionsQueryFactoryV2: jest.fn(),
    voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2: jest.fn(),
    voiceCallsWithSlaStatusAllDimensionsQueryFactoryV2: jest.fn(),
    voiceConnectedAllDimensionsQueryFactoryV2: jest.fn(),
    voiceLiveDashboardWaitTimeCallsAllDimensionsQueryFactoryV2: jest.fn(),
    voiceWaitTimeCallsAllDimensionsQueryFactoryV2: jest.fn(),
}))

const mockStatsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00+01:00',
        end_datetime: '2024-01-01T23:59:59+01:00',
    },
}
const timezone = 'UTC'

describe('VoiceMetricsConfig - drillDownQuery', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call waitingTimeCallsListQueryFactory for AverageWaitTime', () => {
        const config = VoiceMetricsConfig[VoiceMetric.AverageWaitTime]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(waitingTimeCallsListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            timezone,
            VoiceCallSegment.inboundCalls,
        )
    })

    it('should call voiceWaitTimeCallsAllDimensionsQueryFactoryV2 with inboundCalls segment for AverageWaitTime', () => {
        const config = VoiceMetricsConfig[VoiceMetric.AverageWaitTime]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(
            voiceWaitTimeCallsAllDimensionsQueryFactoryV2,
        ).toHaveBeenCalledWith(
            { filters: mockStatsFilters, timezone },
            VoiceCallSegment.inboundCalls,
        )
    })

    it('should call connectedCallsListQueryFactory for AverageTalkTime', () => {
        const config = VoiceMetricsConfig[VoiceMetric.AverageTalkTime]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(connectedCallsListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            timezone,
        )
    })

    it('should call voiceConnectedAllDimensionsQueryFactoryV2 for AverageTalkTime', () => {
        const config = VoiceMetricsConfig[VoiceMetric.AverageTalkTime]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(voiceConnectedAllDimensionsQueryFactoryV2).toHaveBeenCalledWith({
            filters: mockStatsFilters,
            timezone,
        })
    })

    it('should call liveDashboardWaitingTimeCallsListQueryFactory for QueueAverageWaitTime', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueAverageWaitTime]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(
            liveDashboardWaitingTimeCallsListQueryFactory,
        ).toHaveBeenCalledWith(mockStatsFilters, VoiceCallSegment.inboundCalls)
    })

    it('should call voiceLiveDashboardWaitTimeCallsAllDimensionsQueryFactoryV2 with inboundCalls segment for QueueAverageWaitTime', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueAverageWaitTime]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(
            voiceLiveDashboardWaitTimeCallsAllDimensionsQueryFactoryV2,
        ).toHaveBeenCalledWith(
            { filters: mockStatsFilters, timezone },
            VoiceCallSegment.inboundCalls,
        )
    })

    it('should call liveDashboardConnectedCallsListQueryFactory for QueueAverageTalkTime', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueAverageTalkTime]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(
            liveDashboardConnectedCallsListQueryFactory,
        ).toHaveBeenCalledWith(mockStatsFilters)
    })

    it('should call voiceCallsLiveDashboardConnectedAllDimensionsQueryFactoryV2 for QueueAverageTalkTime', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueAverageTalkTime]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(
            voiceCallsLiveDashboardConnectedAllDimensionsQueryFactoryV2,
        ).toHaveBeenCalledWith({ filters: mockStatsFilters, timezone })
    })

    it('should call liveDashBoardVoiceCallListQueryFactory with inboundCalls segment for QueueInboundCalls', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueInboundCalls]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(liveDashBoardVoiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            VoiceCallSegment.inboundCalls,
        )
    })

    it('should call voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2 with inboundCalls segment for QueueInboundCalls', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueInboundCalls]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2,
        ).toHaveBeenCalledWith(
            { filters: mockStatsFilters, timezone },
            VoiceCallSegment.inboundCalls,
        )
    })

    it('should call liveDashBoardVoiceCallListQueryFactory with outboundCalls segment for QueueOutboundCalls', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueOutboundCalls]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(liveDashBoardVoiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            VoiceCallSegment.outboundCalls,
        )
    })

    it('should call voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2 with outboundCalls segment for QueueInboundCalls', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueOutboundCalls]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2,
        ).toHaveBeenCalledWith(
            { filters: mockStatsFilters, timezone },
            VoiceCallSegment.outboundCalls,
        )
    })

    it('should call liveDashBoardVoiceCallListQueryFactory with inboundUnansweredCalls segment for QueueInboundUnansweredCalls', () => {
        const config =
            VoiceMetricsConfig[VoiceMetric.QueueInboundUnansweredCalls]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(liveDashBoardVoiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            VoiceCallSegment.inboundUnansweredCalls,
        )
    })

    it('should call voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2 with inboundUnansweredCalls segment for QueueInboundUnansweredCalls', () => {
        const config =
            VoiceMetricsConfig[VoiceMetric.QueueInboundUnansweredCalls]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2,
        ).toHaveBeenCalledWith(
            { filters: mockStatsFilters, timezone },
            VoiceCallSegment.inboundUnansweredCalls,
        )
    })

    it('should call liveDashBoardVoiceCallListQueryFactory with inboundMissedCalls segment for QueueInboundMissedCalls', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueInboundMissedCalls]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(liveDashBoardVoiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            VoiceCallSegment.inboundMissedCalls,
        )
    })

    it('should call voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2 with inboundMissedCalls segment for QueueInboundMissedCalls', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueInboundMissedCalls]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2,
        ).toHaveBeenCalledWith(
            { filters: mockStatsFilters, timezone },
            VoiceCallSegment.inboundMissedCalls,
        )
    })

    it('should call liveDashBoardVoiceCallListQueryFactory with inboundAbandonedCalls segment for QueueInboundAbandonedCalls', () => {
        const config =
            VoiceMetricsConfig[VoiceMetric.QueueInboundAbandonedCalls]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(liveDashBoardVoiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            VoiceCallSegment.inboundAbandonedCalls,
        )
    })

    it('should call voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2 with inboundAbandonedCalls segment for QueueInboundAbandonedCalls', () => {
        const config =
            VoiceMetricsConfig[VoiceMetric.QueueInboundAbandonedCalls]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2,
        ).toHaveBeenCalledWith(
            { filters: mockStatsFilters, timezone },
            VoiceCallSegment.inboundAbandonedCalls,
        )
    })

    it('should call liveDashBoardVoiceCallListQueryFactory with inboundCancelledCalls segment for QueueInboundCancelledCalls', () => {
        const config =
            VoiceMetricsConfig[VoiceMetric.QueueInboundCancelledCalls]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(liveDashBoardVoiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            VoiceCallSegment.inboundCancelledCalls,
        )
    })

    it('should call voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2 with inboundCancelledCalls segment for QueueInboundCancelledCalls', () => {
        const config =
            VoiceMetricsConfig[VoiceMetric.QueueInboundCancelledCalls]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2,
        ).toHaveBeenCalledWith(
            { filters: mockStatsFilters, timezone },
            VoiceCallSegment.inboundCancelledCalls,
        )
    })

    it('should call liveDashBoardVoiceCallListQueryFactory with inboundCallbackRequestedCalls segment for QueueInboundCallbackRequestedCalls', () => {
        const config =
            VoiceMetricsConfig[VoiceMetric.QueueInboundCallbackRequestedCalls]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(liveDashBoardVoiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            VoiceCallSegment.inboundCallbackRequestedCalls,
        )
    })

    it('should call voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2 with inboundCallbackRequestedCalls segment for QueueInboundCallbackRequestedCalls', () => {
        const config =
            VoiceMetricsConfig[VoiceMetric.QueueInboundCallbackRequestedCalls]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2,
        ).toHaveBeenCalledWith(
            { filters: mockStatsFilters, timezone },
            VoiceCallSegment.inboundCallbackRequestedCalls,
        )
    })

    it('should call voiceCallListQueryFactory with inboundCalls segment for VoiceCallsAchievementRate', () => {
        const config = VoiceMetricsConfig[VoiceMetric.VoiceCallsAchievementRate]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(voiceCallListWithSlaStatusQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            timezone,
            VoiceCallSegment.inboundCalls,
        )
    })

    it('should call voiceCallsWithSlaStatusAllDimensionsQueryFactoryV2 for VoiceCallsAchievementRate', () => {
        const config = VoiceMetricsConfig[VoiceMetric.VoiceCallsAchievementRate]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(
            voiceCallsWithSlaStatusAllDimensionsQueryFactoryV2,
        ).toHaveBeenCalledWith({ filters: mockStatsFilters, timezone })
    })

    it('should call liveDashBoardVoiceCallListQueryFactory with inboundCalls segment for QueueCallsAchievementRate', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueCallsAchievementRate]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(liveDashBoardVoiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            VoiceCallSegment.inboundCalls,
        )
    })

    it('should call voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2 with inboundCalls segment for QueueCallsAchievementRate', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueCallsAchievementRate]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2,
        ).toHaveBeenCalledWith(
            { filters: mockStatsFilters, timezone },
            VoiceCallSegment.inboundCalls,
        )
    })

    it('should call voiceCallListQueryFactory with callSlaBreached segment for VoiceCallsBreachedRate', () => {
        const config = VoiceMetricsConfig[VoiceMetric.VoiceCallsBreachedRate]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(voiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            timezone,
            VoiceCallSegment.callSlaBreached,
        )
    })

    it('should call voiceCallsCountAllDimensionsQueryFactoryV2 with callSlaBreached segment for VoiceCallsBreachedRate', () => {
        const config = VoiceMetricsConfig[VoiceMetric.VoiceCallsBreachedRate]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(voiceCallsCountAllDimensionsQueryFactoryV2).toHaveBeenCalledWith(
            { filters: mockStatsFilters, timezone },
            VoiceCallSegment.callSlaBreached,
        )
    })
})

describe('VoiceAgentsMetricsConfig - drillDownQuery and drillDownQueryV2', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call voiceCallListQueryFactory for AgentTotalCalls', () => {
        const config =
            VoiceAgentsMetricsConfig[VoiceAgentsMetric.AgentTotalCalls]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(voiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            timezone,
        )
    })

    it('should call voiceCallsCountAllDimensionsQueryFactoryV2 for AgentTotalCalls', () => {
        const config =
            VoiceAgentsMetricsConfig[VoiceAgentsMetric.AgentTotalCalls]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(voiceCallsCountAllDimensionsQueryFactoryV2).toHaveBeenCalledWith(
            {
                filters: mockStatsFilters,
                timezone,
            },
        )
    })

    it('should call voiceCallListQueryFactory with inboundUnansweredCallsByAgent segment for AgentInboundMissedCalls', () => {
        const config =
            VoiceAgentsMetricsConfig[VoiceAgentsMetric.AgentInboundMissedCalls]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(voiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            timezone,
            VoiceCallSegment.inboundUnansweredCallsByAgent,
        )
    })

    it('should call voiceCallsCountAllDimensionsQueryFactoryV2 with inboundUnansweredCallsByAgent segment for AgentInboundMissedCalls', () => {
        const config =
            VoiceAgentsMetricsConfig[VoiceAgentsMetric.AgentInboundMissedCalls]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(voiceCallsCountAllDimensionsQueryFactoryV2).toHaveBeenCalledWith(
            { filters: mockStatsFilters, timezone },
            VoiceCallSegment.inboundUnansweredCallsByAgent,
        )
    })

    it('should call voiceCallListQueryFactory with inboundAnsweredCallsByAgent segment for AgentInboundAnsweredCalls', () => {
        const config =
            VoiceAgentsMetricsConfig[
                VoiceAgentsMetric.AgentInboundAnsweredCalls
            ]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(voiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            timezone,
            VoiceCallSegment.inboundAnsweredCallsByAgent,
        )
    })

    it('should call voiceCallsCountAllDimensionsQueryFactoryV2 with inboundAnsweredCallsByAgent segment for AgentInboundAnsweredCalls', () => {
        const config =
            VoiceAgentsMetricsConfig[
                VoiceAgentsMetric.AgentInboundAnsweredCalls
            ]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(voiceCallsCountAllDimensionsQueryFactoryV2).toHaveBeenCalledWith(
            { filters: mockStatsFilters, timezone },
            VoiceCallSegment.inboundAnsweredCallsByAgent,
        )
    })

    it('should call transferredInboundVoiceCallsPerAgentQueryFactory for AgentInboundTransferredCalls', () => {
        const config =
            VoiceAgentsMetricsConfig[
                VoiceAgentsMetric.AgentInboundTransferredCalls
            ]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(
            transferredInboundVoiceCallsPerAgentQueryFactory,
        ).toHaveBeenCalledWith(mockStatsFilters, timezone)
    })

    it('should call transferredInboundVoiceCallsPerAgentQueryV2Factory for AgentInboundTransferredCalls', () => {
        const config =
            VoiceAgentsMetricsConfig[
                VoiceAgentsMetric.AgentInboundTransferredCalls
            ]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(
            transferredInboundVoiceCallsPerAgentQueryV2Factory,
        ).toHaveBeenCalledWith({ filters: mockStatsFilters, timezone })
    })

    it('should call declinedVoiceCallsPerAgentQueryFactory for AgentInboundDeclinedCalls', () => {
        const config =
            VoiceAgentsMetricsConfig[
                VoiceAgentsMetric.AgentInboundDeclinedCalls
            ]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(declinedVoiceCallsPerAgentQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            timezone,
        )
    })

    it('should call declinedCallsPerAgentQueryV2Factory for AgentInboundDeclinedCalls', () => {
        const config =
            VoiceAgentsMetricsConfig[
                VoiceAgentsMetric.AgentInboundDeclinedCalls
            ]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(declinedCallsPerAgentQueryV2Factory).toHaveBeenCalledWith({
            filters: mockStatsFilters,
            timezone,
        })
    })

    it('should call voiceCallListQueryFactory with outboundCalls segment for AgentOutboundCalls', () => {
        const config =
            VoiceAgentsMetricsConfig[VoiceAgentsMetric.AgentOutboundCalls]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(voiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            timezone,
            VoiceCallSegment.outboundCalls,
        )
    })

    it('should call voiceCallsCountAllDimensionsQueryFactoryV2 with outboundCalls segment for AgentOutboundCalls', () => {
        const config =
            VoiceAgentsMetricsConfig[VoiceAgentsMetric.AgentOutboundCalls]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(voiceCallsCountAllDimensionsQueryFactoryV2).toHaveBeenCalledWith(
            { filters: mockStatsFilters, timezone },
            VoiceCallSegment.outboundCalls,
        )
    })

    it('should call connectedCallsListQueryFactory for AgentAverageTalkTime', () => {
        const config =
            VoiceAgentsMetricsConfig[VoiceAgentsMetric.AgentAverageTalkTime]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(connectedCallsListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            timezone,
        )
    })

    it('should call voiceConnectedAllDimensionsQueryFactoryV2 for AgentAverageTalkTime', () => {
        const config =
            VoiceAgentsMetricsConfig[VoiceAgentsMetric.AgentAverageTalkTime]

        config.drillDownQueryV2?.({ filters: mockStatsFilters, timezone })

        expect(voiceConnectedAllDimensionsQueryFactoryV2).toHaveBeenCalledWith({
            filters: mockStatsFilters,
            timezone,
        })
    })
})
