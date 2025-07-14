import {
    fetchClosedTicketsTrend,
    fetchZeroTouchTicketsTrend,
    useClosedTicketsTrend,
    useZeroTouchTicketsTrend,
} from 'domains/reporting/hooks/metricTrends'
import {
    fetchZeroTouchTicketsMetricTrend,
    useZeroTouchTicketsMetricTrend,
} from 'domains/reporting/hooks/support-performance/overview/useZeroTouchTicketsMetricTrend'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/hooks/metricTrends')
const useZeroTicketsTrendMock = assumeMock(useZeroTouchTicketsTrend)
const useClosedTicketsTrendMock = assumeMock(useClosedTicketsTrend)
const fetchZeroTicketsTrendMock = assumeMock(fetchZeroTouchTicketsTrend)
const fetchClosedTicketsTrendMock = assumeMock(fetchClosedTicketsTrend)

describe('ZeroTouchTicketsPercentageMetricTrend', () => {
    describe('useZeroTouchTicketsPercentageMetric', () => {
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: '2020-01-01',
                start_datetime: '2020-01-01',
            },
        }
        const timezone = 'America/New_York'

        it('should calculate percentages correctly', () => {
            const mockData = {
                data: { value: 50, prevValue: 30 },
                isFetching: false,
                isError: false,
            }
            const mockClosedTicketsPerAgent = {
                data: { value: 200, prevValue: 100 },
                isFetching: false,
                isError: false,
            }

            useZeroTicketsTrendMock.mockImplementation(() => mockData)
            useClosedTicketsTrendMock.mockImplementation(
                () => mockClosedTicketsPerAgent,
            )

            const { result } = renderHook(() =>
                useZeroTouchTicketsMetricTrend(statsFilters, timezone),
            )

            expect(result?.current?.data?.value).toBe(mockData.data.value)
            expect(result?.current?.data?.prevValue).toBe(
                mockData.data.prevValue,
            )
            expect(result.current.isFetching).toBe(false)
            expect(result.current.isError).toBe(false)
        })

        it('should return undefined when loading', () => {
            const mockData = {
                data: undefined,
                isFetching: true,
                isError: false,
            }
            const mockClosedTicketsPerAgent = {
                data: undefined,
                isFetching: false,
                isError: false,
            }

            useZeroTicketsTrendMock.mockReturnValue(mockData)
            useClosedTicketsTrendMock.mockReturnValue(mockClosedTicketsPerAgent)

            const { result } = renderHook(() =>
                useZeroTouchTicketsMetricTrend(statsFilters, timezone),
            )

            expect(result?.current?.data).toBe(undefined)
            expect(result.current.isFetching).toBe(true)
            expect(result.current.isError).toBe(false)
        })

        it('should return null on missing data', () => {
            const mockData = {
                data: undefined,
                isFetching: false,
                isError: false,
            }
            const mockClosedTicketsPerAgent = {
                data: undefined,
                isFetching: false,
                isError: false,
            }

            useZeroTicketsTrendMock.mockImplementation(() => mockData)
            useClosedTicketsTrendMock.mockImplementation(
                () => mockClosedTicketsPerAgent,
            )

            const { result } = renderHook(() =>
                useZeroTouchTicketsMetricTrend(statsFilters, timezone),
            )

            expect(result?.current?.data?.value).toBe(null)
            expect(result?.current?.data?.prevValue).toBe(null)
            expect(result.current.isFetching).toBe(false)
            expect(result.current.isError).toBe(false)
        })
    })

    describe('fetchZeroTouchTicketsPercentageMetricTrend', () => {
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: '2020-01-01',
                start_datetime: '2020-01-01',
            },
        }
        const timezone = 'America/New_York'

        it('should calculate percentages correctly', async () => {
            const mockData = {
                data: { value: 50, prevValue: 30 },
                isFetching: false,
                isError: false,
            }
            const mockClosedTicketsPerAgent = {
                data: { value: 200, prevValue: 100 },
                isFetching: false,
                isError: false,
            }

            fetchZeroTicketsTrendMock.mockResolvedValue(mockData)
            fetchClosedTicketsTrendMock.mockResolvedValue(
                mockClosedTicketsPerAgent,
            )

            const result = await fetchZeroTouchTicketsMetricTrend(
                statsFilters,
                timezone,
            )

            expect(result?.data?.value).toBe(mockData.data.value)
            expect(result?.data?.prevValue).toBe(mockData.data.prevValue)
            expect(result.isFetching).toBe(false)
            expect(result.isError).toBe(false)
        })

        it('should return null on missing data', async () => {
            const mockData = {
                data: undefined,
                isFetching: false,
                isError: false,
            }
            const mockClosedTicketsPerAgent = {
                data: undefined,
                isFetching: false,
                isError: false,
            }

            fetchZeroTicketsTrendMock.mockResolvedValue(mockData)
            fetchClosedTicketsTrendMock.mockResolvedValue(
                mockClosedTicketsPerAgent,
            )

            const result = await fetchZeroTouchTicketsMetricTrend(
                statsFilters,
                timezone,
            )

            expect(result?.data?.value).toBe(null)
            expect(result?.data?.prevValue).toBe(null)
            expect(result.isFetching).toBe(false)
            expect(result.isError).toBe(false)
        })

        it('should return undefined and isError on error', async () => {
            const mockData = {
                data: undefined,
                isFetching: false,
                isError: false,
            }
            const mockClosedTicketsPerAgent = {
                data: undefined,
                isFetching: false,
                isError: false,
            }

            fetchZeroTicketsTrendMock.mockRejectedValue(mockData)
            fetchClosedTicketsTrendMock.mockRejectedValue(
                mockClosedTicketsPerAgent,
            )

            const result = await fetchZeroTouchTicketsMetricTrend(
                statsFilters,
                timezone,
            )

            expect(result?.data).toBe(undefined)
            expect(result.isFetching).toBe(false)
            expect(result.isError).toBe(true)
        })
    })
})
