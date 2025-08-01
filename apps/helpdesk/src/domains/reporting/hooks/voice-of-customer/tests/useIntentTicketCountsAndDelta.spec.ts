import { assumeMock, renderHook } from '@repo/testing'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    formatTicketCountData,
    useIntentTicketCountsAndDelta,
} from 'domains/reporting/hooks/voice-of-customer/useIntentTicketCountsAndDelta'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { TopIntentsColumns } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/useMetricPerDimension')

const useStatsFiltersMock = assumeMock(useStatsFilters)
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

describe('formatTicketCountData', () => {
    const mockData = {
        value: 100,
        decile: 1,
        allData: [
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValue]:
                    'intent1',
                [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '50',
            },
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValue]:
                    'intent2',
                [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '30',
            },
        ],
    }

    const mockPreviousPeriodData = {
        value: 90,
        decile: 1,
        allData: [
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValue]:
                    'intent1',
                [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '40',
            },
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValue]:
                    'intent2',
                [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '25',
            },
        ],
    }

    it('should format data correctly with both current and previous period data', () => {
        const result = formatTicketCountData(mockData, mockPreviousPeriodData)

        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({
            category: 'intent1',
            value: '50',
            prevValue: '40',
        })
        expect(result[1]).toEqual({
            category: 'intent2',
            value: '30',
            prevValue: '25',
        })
    })

    it('should handle null data', () => {
        const result = formatTicketCountData(null, null)
        expect(result).toEqual([])
    })

    it('should handle missing previous period data', () => {
        const result = formatTicketCountData(mockData, null)
        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({
            category: 'intent1',
            value: '50',
            prevValue: undefined,
        })
    })

    it('should handle missing current period data', () => {
        const result = formatTicketCountData(null, mockPreviousPeriodData)
        expect(result).toEqual([])
    })
})

describe('useIntentTicketCountsAndDelta', () => {
    const mockIntentCustomFieldId = 123
    const mockOrder = {
        column: TopIntentsColumns.Intent,
        direction: OrderDirection.Asc,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00+00:00',
                    end_datetime: '2024-01-07T23:59:59+00:00',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
    })

    it('should return formatted data when both current and previous period data are available', () => {
        const mockCurrentData = {
            value: 100,
            decile: 1,
            allData: [
                {
                    [TicketCustomFieldsDimension.TicketCustomFieldsValue]:
                        'intent1',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '50',
                },
            ],
        }

        const mockPreviousData = {
            value: 90,
            decile: 1,
            allData: [
                {
                    [TicketCustomFieldsDimension.TicketCustomFieldsValue]:
                        'intent1',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '40',
                },
            ],
        }

        useMetricPerDimensionMock
            .mockReturnValueOnce({
                data: mockCurrentData,
                isError: false,
                isFetching: false,
            })
            .mockReturnValueOnce({
                data: mockPreviousData,
                isError: false,
                isFetching: false,
            })

        const { result } = renderHook(() =>
            useIntentTicketCountsAndDelta(
                mockIntentCustomFieldId,
                mockOrder.direction,
                TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            ),
        )

        expect(result.current.data).toHaveLength(1)
        expect(result.current.data[0]).toEqual({
            category: 'intent1',
            value: '50',
            prevValue: '40',
        })
        expect(result.current.isError).toBe(false)
        expect(result.current.isFetching).toBe(false)
    })

    it('should handle loading state', () => {
        useMetricPerDimensionMock
            .mockReturnValueOnce({
                data: null,
                isError: false,
                isFetching: true,
            })
            .mockReturnValueOnce({
                data: null,
                isError: false,
                isFetching: false,
            })

        const { result } = renderHook(() =>
            useIntentTicketCountsAndDelta(
                mockIntentCustomFieldId,
                mockOrder.direction,
                TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            ),
        )

        expect(result.current.isFetching).toBe(true)
        expect(result.current.data).toEqual([])
    })

    it('should handle error state', () => {
        useMetricPerDimensionMock
            .mockReturnValueOnce({
                data: null,
                isError: true,
                isFetching: false,
            })
            .mockReturnValueOnce({
                data: null,
                isError: false,
                isFetching: false,
            })

        const { result } = renderHook(() =>
            useIntentTicketCountsAndDelta(
                mockIntentCustomFieldId,
                mockOrder.direction,
                TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            ),
        )

        expect(result.current.isError).toBe(true)
        expect(result.current.data).toEqual([])
    })

    it('should handle empty data', () => {
        useMetricPerDimensionMock
            .mockReturnValueOnce({
                data: { value: 0, decile: 0, allData: [] },
                isError: false,
                isFetching: false,
            })
            .mockReturnValueOnce({
                data: { value: 0, decile: 0, allData: [] },
                isError: false,
                isFetching: false,
            })

        const { result } = renderHook(() =>
            useIntentTicketCountsAndDelta(
                mockIntentCustomFieldId,
                mockOrder.direction,
                TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            ),
        )

        expect(result.current.data).toEqual([])
        expect(result.current.isError).toBe(false)
        expect(result.current.isFetching).toBe(false)
    })
})
