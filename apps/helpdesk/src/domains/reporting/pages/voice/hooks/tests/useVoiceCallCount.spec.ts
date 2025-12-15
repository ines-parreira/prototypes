import { assumeMock, renderHook } from '@repo/testing'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { voiceCallCountQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { voiceCallsCountQueryFactoryV2 } from 'domains/reporting/models/scopes/voiceCalls'
import { APIOnlyFilterKey } from 'domains/reporting/models/stat/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { CALL_LIST_PAGE_SIZE } from 'domains/reporting/pages/voice/constants/voiceOverview'
import { VoiceCallDisplayStatus } from 'models/voiceCall/types'

import { LogicalOperatorEnum } from '../../../common/components/Filter/constants'
import { useVoiceCallCount } from '../useVoiceCallCount'

jest.mock('domains/reporting/hooks/useMetric')
jest.mock('domains/reporting/models/queryFactories/voice/voiceCall')
jest.mock('domains/reporting/models/scopes/voiceCalls')
jest.mock('domains/reporting/models/queryFactories/utils')

const useMetricMock = assumeMock(useMetric)
const voiceCallCountQueryFactoryMock = assumeMock(voiceCallCountQueryFactory)
const voiceCallsCountQueryFactoryV2Mock = assumeMock(
    voiceCallsCountQueryFactoryV2,
)
const withLogicalOperatorMock = assumeMock(withLogicalOperator)

describe('useVoiceCallCount', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: '2024-01-01T23:59:59Z',
            start_datetime: '2024-01-01T00:00:00Z',
        },
    }
    const timezone = 'UTC'

    const mockQueryV1: ReturnType<typeof voiceCallCountQueryFactory> = {
        metricName: METRIC_NAMES.VOICE_CALL_COUNT_TABLE,
        measures: [],
        dimensions: [],
        timezone: 'UTC',
        segments: [],
        filters: [],
    }
    const mockQueryV2: ReturnType<typeof voiceCallsCountQueryFactoryV2> = {
        metricName: METRIC_NAMES.VOICE_CALL_COUNT_TREND,
        scope: MetricScope.VoiceCalls,
        measures: ['voiceCallsCount'],
    }
    const mockWithLogicalOperator = {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [] as string[],
    }

    beforeEach(() => {
        jest.clearAllMocks()
        voiceCallCountQueryFactoryMock.mockReturnValue(mockQueryV1)
        voiceCallsCountQueryFactoryV2Mock.mockReturnValue(mockQueryV2)
        withLogicalOperatorMock.mockReturnValue(mockWithLogicalOperator)
        useMetricMock.mockReturnValue({
            data: { value: 100 },
            isFetching: false,
            isError: false,
        })
    })

    describe('query factories', () => {
        it('should call voiceCallCountQueryFactory with correct parameters', () => {
            renderHook(() => useVoiceCallCount(statsFilters, timezone))

            expect(voiceCallCountQueryFactoryMock).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                undefined,
                undefined,
                undefined,
                METRIC_NAMES.VOICE_CALL_COUNT_TABLE,
            )
        })

        it('should call voiceCallsCountQueryFactoryV2 with correct parameters', () => {
            renderHook(() => useVoiceCallCount(statsFilters, timezone))

            expect(withLogicalOperatorMock).toHaveBeenCalledWith(
                [],
                LogicalOperatorEnum.ONE_OF,
            )
            expect(voiceCallsCountQueryFactoryV2Mock).toHaveBeenCalledWith(
                {
                    filters: {
                        ...statsFilters,
                        [APIOnlyFilterKey.DisplayStatus]:
                            mockWithLogicalOperator,
                    },
                    timezone,
                },
                undefined,
            )
        })

        it('should call useMetric with both queries', () => {
            renderHook(() => useVoiceCallCount(statsFilters, timezone))

            expect(useMetricMock).toHaveBeenCalledWith(mockQueryV1, mockQueryV2)
        })
    })

    describe('with segment parameter', () => {
        it('should pass segment to both query factories', () => {
            const segment = VoiceCallSegment.inboundCalls

            renderHook(() => useVoiceCallCount(statsFilters, timezone, segment))

            expect(voiceCallCountQueryFactoryMock).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                segment,
                undefined,
                undefined,
                METRIC_NAMES.VOICE_CALL_COUNT_TABLE,
            )
            expect(voiceCallsCountQueryFactoryV2Mock).toHaveBeenCalledWith(
                expect.any(Object),
                segment,
            )
        })
    })

    describe('with statusFilter parameter', () => {
        it('should pass statusFilter to voiceCallCountQueryFactory and withLogicalOperator', () => {
            const statusFilter = [
                VoiceCallDisplayStatus.Answered,
                VoiceCallDisplayStatus.Missed,
            ]

            renderHook(() =>
                useVoiceCallCount(
                    statsFilters,
                    timezone,
                    undefined,
                    CALL_LIST_PAGE_SIZE,
                    statusFilter,
                ),
            )

            expect(voiceCallCountQueryFactoryMock).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                undefined,
                statusFilter,
                undefined,
                METRIC_NAMES.VOICE_CALL_COUNT_TABLE,
            )
            expect(withLogicalOperatorMock).toHaveBeenCalledWith(
                statusFilter,
                LogicalOperatorEnum.ONE_OF,
            )
        })
    })

    describe('return values', () => {
        it('should return total and totalPages with data', () => {
            useMetricMock.mockReturnValue({
                data: { value: 100 },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useVoiceCallCount(statsFilters, timezone),
            )

            expect(result.current).toEqual({
                total: 100,
                totalPages: 10,
            })
        })

        it('should return total 0 when data is undefined', () => {
            useMetricMock.mockReturnValue({
                data: undefined,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useVoiceCallCount(statsFilters, timezone),
            )

            expect(result.current).toEqual({
                total: 0,
                totalPages: 0,
            })
        })

        it('should return total 0 when data.value is null', () => {
            useMetricMock.mockReturnValue({
                data: { value: null },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useVoiceCallCount(statsFilters, timezone),
            )

            expect(result.current).toEqual({
                total: 0,
                totalPages: 0,
            })
        })

        it('should return total 0 when data.value is 0', () => {
            useMetricMock.mockReturnValue({
                data: { value: 0 },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useVoiceCallCount(statsFilters, timezone),
            )

            expect(result.current).toEqual({
                total: 0,
                totalPages: 0,
            })
        })
    })

    describe('pagination calculations', () => {
        it('should use default CALL_LIST_PAGE_SIZE when perPage is not provided', () => {
            useMetricMock.mockReturnValue({
                data: { value: CALL_LIST_PAGE_SIZE * 2 },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useVoiceCallCount(statsFilters, timezone),
            )

            expect(result.current.totalPages).toBe(2)
        })

        it('should calculate totalPages based on custom perPage', () => {
            useMetricMock.mockReturnValue({
                data: { value: 25 },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useVoiceCallCount(statsFilters, timezone, undefined, 5),
            )

            expect(result.current).toEqual({
                total: 25,
                totalPages: 5,
            })
        })

        it('should round up totalPages for partial pages', () => {
            useMetricMock.mockReturnValue({
                data: { value: 23 },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useVoiceCallCount(statsFilters, timezone, undefined, 5),
            )

            expect(result.current).toEqual({
                total: 23,
                totalPages: 5, // Math.ceil(23/5) = 5
            })
        })

        it('should return 1 page when total is less than perPage', () => {
            useMetricMock.mockReturnValue({
                data: { value: 3 },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useVoiceCallCount(statsFilters, timezone, undefined, 10),
            )

            expect(result.current).toEqual({
                total: 3,
                totalPages: 1,
            })
        })
    })
})
