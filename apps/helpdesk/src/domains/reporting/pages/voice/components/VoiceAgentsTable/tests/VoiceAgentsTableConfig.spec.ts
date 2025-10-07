import {
    columns,
    getQuery,
} from 'domains/reporting/pages/voice/components/VoiceAgentsTable/VoiceAgentsTableConfig'
import {
    useAnsweredCallsMetricPerAgent,
    useAverageTalkTimeMetricPerAgent,
    useDeclinedCallsMetricPerAgent,
    useMissedCallsMetricPerAgent,
    useOutboundCallsMetricPerAgent,
    useTotalCallsMetricPerAgent,
    useTransferredInboundCallsMetricPerAgent,
} from 'domains/reporting/pages/voice/hooks/metricsPerDimension'
import { VoiceAgentsTableColumn } from 'domains/reporting/state/ui/stats/types'

describe('VoiceAgentsTableConfig', () => {
    it('should return the correct query hook for each column', () => {
        const agentNameQuery = getQuery(VoiceAgentsTableColumn.AgentName)
        expect(agentNameQuery({} as any, 'UTC')).toEqual({
            isFetching: false,
            isError: false,
            data: null,
        })

        expect(getQuery(VoiceAgentsTableColumn.TotalCalls)).toBe(
            useTotalCallsMetricPerAgent,
        )

        expect(getQuery(VoiceAgentsTableColumn.InboundAnsweredCalls)).toBe(
            useAnsweredCallsMetricPerAgent,
        )

        expect(getQuery(VoiceAgentsTableColumn.InboundTransferredCalls)).toBe(
            useTransferredInboundCallsMetricPerAgent,
        )

        expect(getQuery(VoiceAgentsTableColumn.InboundMissedCalls)).toBe(
            useMissedCallsMetricPerAgent,
        )

        expect(getQuery(VoiceAgentsTableColumn.InboundDeclinedCalls)).toBe(
            useDeclinedCallsMetricPerAgent,
        )

        expect(getQuery(VoiceAgentsTableColumn.OutboundCalls)).toBe(
            useOutboundCallsMetricPerAgent,
        )

        expect(getQuery(VoiceAgentsTableColumn.AverageTalkTime)).toBe(
            useAverageTalkTimeMetricPerAgent,
        )
    })

    it('should have columns in the correct order', () => {
        const columnIds = columns.map((c) => c.id)
        expect(columnIds).toEqual([
            VoiceAgentsTableColumn.AgentName,
            VoiceAgentsTableColumn.TotalCalls,
            VoiceAgentsTableColumn.InboundAnsweredCalls,
            VoiceAgentsTableColumn.InboundTransferredCalls,
            VoiceAgentsTableColumn.InboundMissedCalls,
            VoiceAgentsTableColumn.InboundDeclinedCalls,
            VoiceAgentsTableColumn.OutboundCalls,
            VoiceAgentsTableColumn.AverageTalkTime,
        ])
    })
})
