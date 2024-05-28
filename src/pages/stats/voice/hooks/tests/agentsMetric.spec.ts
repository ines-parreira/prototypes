import moment from 'moment/moment'
import {renderHook} from '@testing-library/react-hooks'

import {assumeMock} from 'utils/testing'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {useMetric} from 'hooks/reporting/useMetric'
import {
    VoiceCallMeasure,
    VoiceCallMember,
    VoiceCallSegment,
} from 'models/reporting/cubes/VoiceCallCube'
import {
    VoiceEventsByAgentMeasure,
    VoiceEventsByAgentMember,
    VoiceEventsByAgentSegment,
} from 'models/reporting/cubes/VoiceEventsByAgent'

import {
    useTotalCallsMetric,
    useAnsweredCallsMetric,
    useMissedCallsMetric,
    useOutboundCallsMetric,
    useDeclinedCallsMetric,
    useAverageTalkTimeMetric,
} from '../agentMetrics'

jest.mock('hooks/reporting/useMetric')
const useMetricMock = assumeMock(useMetric)

describe('metricsPerDimension', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

    it('useTotalCallsMetric', () => {
        renderHook(() => useTotalCallsMetric(statsFilters, 'UTC'))

        expect(useMetricMock.mock.calls[0]).toEqual([
            {
                dimensions: [],
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: 'afterDate',
                        values: [statsFilters.period.start_datetime],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: 'beforeDate',
                        values: [statsFilters.period.end_datetime],
                    },
                    {
                        member: VoiceCallMember.AgentId,
                        operator: 'set',
                        values: [],
                    },
                ],
                measures: [VoiceCallMeasure.VoiceCallCount],
                segments: [],
                timezone: 'UTC',
            },
        ])
    })

    it('useAnsweredCallsMetric', () => {
        renderHook(() => useAnsweredCallsMetric(statsFilters, 'UTC'))

        expect(useMetricMock.mock.calls[0]).toEqual([
            {
                dimensions: [],
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: 'afterDate',
                        values: [statsFilters.period.start_datetime],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: 'beforeDate',
                        values: [statsFilters.period.end_datetime],
                    },
                    {
                        member: VoiceCallMember.AgentId,
                        operator: 'set',
                        values: [],
                    },
                ],
                measures: [VoiceCallMeasure.VoiceCallCount],
                segments: [VoiceCallSegment.answeredCallsByAgent],
                timezone: 'UTC',
            },
        ])
    })

    it('useMissedCallsMetric', () => {
        renderHook(() => useMissedCallsMetric(statsFilters, 'UTC'))

        expect(useMetricMock.mock.calls[0]).toEqual([
            {
                dimensions: [],
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: 'afterDate',
                        values: [statsFilters.period.start_datetime],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: 'beforeDate',
                        values: [statsFilters.period.end_datetime],
                    },
                    {
                        member: VoiceCallMember.AgentId,
                        operator: 'set',
                        values: [],
                    },
                ],
                measures: [VoiceCallMeasure.VoiceCallCount],
                segments: [VoiceCallSegment.missedCallsByAgent],
                timezone: 'UTC',
            },
        ])
    })

    it('useOutboundCallsMetric', () => {
        renderHook(() => useOutboundCallsMetric(statsFilters, 'UTC'))

        expect(useMetricMock.mock.calls[0]).toEqual([
            {
                dimensions: [],
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: 'afterDate',
                        values: [statsFilters.period.start_datetime],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: 'beforeDate',
                        values: [statsFilters.period.end_datetime],
                    },
                    {
                        member: VoiceCallMember.AssignedAgentId,
                        operator: 'set',
                        values: [],
                    },
                ],
                measures: [VoiceCallMeasure.VoiceCallCount],
                segments: [VoiceCallSegment.outboundCalls],
                timezone: 'UTC',
            },
        ])
    })

    it('useDeclinedCallsMetric', () => {
        renderHook(() => useDeclinedCallsMetric(statsFilters, 'UTC'))

        expect(useMetricMock.mock.calls[0]).toEqual([
            {
                dimensions: [],
                filters: [
                    {
                        member: VoiceEventsByAgentMember.PeriodStart,
                        operator: 'afterDate',
                        values: [statsFilters.period.start_datetime],
                    },
                    {
                        member: VoiceEventsByAgentMember.PeriodEnd,
                        operator: 'beforeDate',
                        values: [statsFilters.period.end_datetime],
                    },
                    {
                        member: VoiceEventsByAgentMember.AgentId,
                        operator: 'set',
                        values: [],
                    },
                ],
                measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
                segments: [VoiceEventsByAgentSegment.declinedCalls],
                timezone: 'UTC',
            },
        ])
    })

    it('useAverageTalkTimeMetric', () => {
        renderHook(() => useAverageTalkTimeMetric(statsFilters, 'UTC'))

        expect(useMetricMock.mock.calls[0]).toEqual([
            {
                dimensions: [],
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: 'afterDate',
                        values: [statsFilters.period.start_datetime],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: 'beforeDate',
                        values: [statsFilters.period.end_datetime],
                    },
                    {
                        member: VoiceCallMember.AssignedAgentId,
                        operator: 'set',
                        values: [],
                    },
                ],
                measures: [VoiceCallMeasure.VoiceCallAverageTalkTime],
                segments: [],
                timezone: 'UTC',
            },
        ])
    })
})
