import { act, renderHook } from '@testing-library/react-hooks'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useMetric } from 'hooks/reporting/useMetric'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { voiceCallCountQueryFactory } from 'models/reporting/queryFactories/voice/voiceCall'
import { FilterKey } from 'models/stat/types'
import { NOT_AVAILABLE_PLACEHOLDER } from 'pages/stats/common/utils'
import { assumeMock } from 'utils/testing'

import { useMetricFormat } from '../useMetricFormat'

jest.mock('hooks/reporting/support-performance/useStatsFilters')
jest.mock('hooks/reporting/useMetric')
jest.mock('models/reporting/queryFactories/voice/voiceCall')

const useStatsFiltersMock = assumeMock(useStatsFilters)
const useMetricMock = assumeMock(useMetric)
const voiceCallCountQueryFactoryMock = assumeMock(voiceCallCountQueryFactory)

describe('useMetricFormat', () => {
    const defaultQueryFactory = {} as ReturnType<
        typeof voiceCallCountQueryFactory
    >
    const mockCleanStatsFilters = {
        filters: [],
        [FilterKey.Period]: {
            start_datetime: '2023-01-01T00:00:00Z',
            end_datetime: '2023-01-31T23:59:59Z',
        },
    }
    const mockUserTimezone = 'UTC'

    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: mockCleanStatsFilters,
            userTimezone: mockUserTimezone,
        } as any)

        voiceCallCountQueryFactoryMock.mockReturnValue(defaultQueryFactory)

        useMetricMock.mockReturnValue({
            data: { value: 100 },
            isFetching: false,
            isError: false,
        })
    })

    it('should initialize with default values', () => {
        const { result } = renderHook(() =>
            useMetricFormat({
                isPercentageEnabled: false,
                value: 50,
            }),
        )

        expect(result.current.selectedFormat).toBe('integer')
        expect(voiceCallCountQueryFactoryMock).toHaveBeenCalledWith(
            mockCleanStatsFilters,
            mockUserTimezone,
            VoiceCallSegment.inboundCalls,
        )
        expect(useMetricMock).toHaveBeenCalledWith(defaultQueryFactory, false)
    })

    it('should use provided queryFactory when specified', () => {
        const customQueryFactory = {} as ReturnType<
            typeof voiceCallCountQueryFactory
        >

        renderHook(() =>
            useMetricFormat({
                isPercentageEnabled: true,
                value: 50,
                queryFactory: customQueryFactory,
            }),
        )

        expect(useMetricMock).toHaveBeenCalledWith(customQueryFactory, true)
    })

    it('should format value using the selectedFormat', () => {
        const { result } = renderHook(() =>
            useMetricFormat({
                isPercentageEnabled: false,
                value: 50.123,
                defaultValueFormat: 'decimal',
            }),
        )

        expect(result.current.metricValue).toBe('50.12')
    })

    it('should calculate percentage when selectedFormat is percent', () => {
        useMetricMock.mockReturnValue({
            data: { value: 10 },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() =>
            useMetricFormat({
                isPercentageEnabled: true,
                value: 8,
                defaultValueFormat: 'percent',
            }),
        )

        expect(result.current.metricValue).toBe('80%')
    })

    it('should handle null value', () => {
        const { result } = renderHook(() =>
            useMetricFormat({
                isPercentageEnabled: false,
                value: null,
            }),
        )

        expect(result.current.metricValue).toBe(NOT_AVAILABLE_PLACEHOLDER)
    })

    it('should handle undefined value', () => {
        const { result } = renderHook(() =>
            useMetricFormat({
                isPercentageEnabled: false,
                value: undefined,
            }),
        )

        expect(result.current.metricValue).toBe(NOT_AVAILABLE_PLACEHOLDER)
    })

    it('should handle missing allCallsMetric.value when calculating percentage', () => {
        useMetricMock.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() =>
            useMetricFormat({
                isPercentageEnabled: true,
                value: 50,
                defaultValueFormat: 'percent',
            }),
        )

        // Should just return the original value since allCallsMetric.value is missing
        expect(result.current.metricValue).toBe('50%')
    })

    it('should update selectedFormat when setSelectedFormat is called', () => {
        const { result } = renderHook(() =>
            useMetricFormat({
                isPercentageEnabled: false,
                value: 50,
            }),
        )

        act(() => {
            result.current.setSelectedFormat('percent')
        })

        expect(result.current.selectedFormat).toBe('percent')
    })

    it('should expose isFetching state from useMetric', () => {
        useMetricMock.mockReturnValue({
            data: { value: 100 },
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() =>
            useMetricFormat({
                isPercentageEnabled: false,
                value: 50,
            }),
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should return formatted metric value', () => {
        const { result } = renderHook(() =>
            useMetricFormat({
                isPercentageEnabled: false,
                value: 50,
            }),
        )

        expect(result.current.metricValue).toBe('50')
    })
})
