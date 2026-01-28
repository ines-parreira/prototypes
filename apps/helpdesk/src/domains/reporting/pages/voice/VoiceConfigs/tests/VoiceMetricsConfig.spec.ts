import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    connectedCallsListQueryFactory,
    liveDashboardConnectedCallsListQueryFactory,
    liveDashBoardVoiceCallListQueryFactory,
    liveDashboardWaitingTimeCallsListQueryFactory,
    voiceCallListQueryFactory,
    waitingTimeCallsListQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { VoiceMetricsConfig } from 'domains/reporting/pages/voice/VoiceConfigs/VoiceMetricsConfig'
import { VoiceMetric } from 'domains/reporting/state/ui/stats/types'

jest.mock('domains/reporting/models/queryFactories/voice/voiceCall', () => ({
    waitingTimeCallsListQueryFactory: jest.fn(),
    connectedCallsListQueryFactory: jest.fn(),
    liveDashboardWaitingTimeCallsListQueryFactory: jest.fn(),
    liveDashboardConnectedCallsListQueryFactory: jest.fn(),
    liveDashBoardVoiceCallListQueryFactory: jest.fn(),
    voiceCallListQueryFactory: jest.fn(),
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

    it('should call connectedCallsListQueryFactory for AverageTalkTime', () => {
        const config = VoiceMetricsConfig[VoiceMetric.AverageTalkTime]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(connectedCallsListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            timezone,
        )
    })

    it('should call liveDashboardWaitingTimeCallsListQueryFactory for QueueAverageWaitTime', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueAverageWaitTime]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(
            liveDashboardWaitingTimeCallsListQueryFactory,
        ).toHaveBeenCalledWith(mockStatsFilters, VoiceCallSegment.inboundCalls)
    })

    it('should call liveDashboardConnectedCallsListQueryFactory for QueueAverageTalkTime', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueAverageTalkTime]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(
            liveDashboardConnectedCallsListQueryFactory,
        ).toHaveBeenCalledWith(mockStatsFilters)
    })

    it('should call liveDashBoardVoiceCallListQueryFactory with inboundCalls segment for QueueInboundCalls', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueInboundCalls]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(liveDashBoardVoiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
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

    it('should call liveDashBoardVoiceCallListQueryFactory with inboundUnansweredCalls segment for QueueInboundUnansweredCalls', () => {
        const config =
            VoiceMetricsConfig[VoiceMetric.QueueInboundUnansweredCalls]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(liveDashBoardVoiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
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

    it('should call liveDashBoardVoiceCallListQueryFactory with inboundAbandonedCalls segment for QueueInboundAbandonedCalls', () => {
        const config =
            VoiceMetricsConfig[VoiceMetric.QueueInboundAbandonedCalls]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(liveDashBoardVoiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
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

    it('should call liveDashBoardVoiceCallListQueryFactory with inboundCallbackRequestedCalls segment for QueueInboundCallbackRequestedCalls', () => {
        const config =
            VoiceMetricsConfig[VoiceMetric.QueueInboundCallbackRequestedCalls]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(liveDashBoardVoiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            VoiceCallSegment.inboundCallbackRequestedCalls,
        )
    })

    it('should call voiceCallListQueryFactory with inboundCalls segment for VoiceCallsAchievementRate', () => {
        const config = VoiceMetricsConfig[VoiceMetric.VoiceCallsAchievementRate]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(voiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
            timezone,
            VoiceCallSegment.inboundCalls,
        )
    })

    it('should call liveDashBoardVoiceCallListQueryFactory with inboundCalls segment for QueueCallsAchievementRate', () => {
        const config = VoiceMetricsConfig[VoiceMetric.QueueCallsAchievementRate]

        config.drillDownQuery(mockStatsFilters, timezone)

        expect(liveDashBoardVoiceCallListQueryFactory).toHaveBeenCalledWith(
            mockStatsFilters,
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
})
