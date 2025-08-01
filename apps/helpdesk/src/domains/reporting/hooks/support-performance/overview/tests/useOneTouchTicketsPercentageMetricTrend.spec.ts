import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchClosedTicketsTrend,
    fetchOneTouchTicketsTrend,
    useClosedTicketsTrend,
    useOneTouchTicketsTrend,
} from 'domains/reporting/hooks/metricTrends'
import {
    fetchOneTouchTicketsPercentageMetricTrend,
    useOneTouchTicketsPercentageMetricTrend,
} from 'domains/reporting/hooks/support-performance/overview/useOneTouchTicketsPercentageMetricTrend'
import { StatsFilters } from 'domains/reporting/models/stat/types'

jest.mock('domains/reporting/hooks/metricTrends')
const useOneTicketsTrendMock = assumeMock(useOneTouchTicketsTrend)
const useClosedTicketsTrendMock = assumeMock(useClosedTicketsTrend)
const fetchOneTicketsTrendMock = assumeMock(fetchOneTouchTicketsTrend)
const fetchClosedTicketsTrendMock = assumeMock(fetchClosedTicketsTrend)

describe('OneTouchTicketsPercentageMetricTrend', () => {
    describe('useOneTouchTicketsPercentageMetric', () => {
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

            useOneTicketsTrendMock.mockImplementation(() => mockData)
            useClosedTicketsTrendMock.mockImplementation(
                () => mockClosedTicketsPerAgent,
            )

            const { result } = renderHook(() =>
                useOneTouchTicketsPercentageMetricTrend(statsFilters, timezone),
            )

            expect(result?.current?.data?.value).toBe(25)
            expect(result?.current?.data?.prevValue).toBe(30)
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

            useOneTicketsTrendMock.mockReturnValue(mockData)
            useClosedTicketsTrendMock.mockReturnValue(mockClosedTicketsPerAgent)

            const { result } = renderHook(() =>
                useOneTouchTicketsPercentageMetricTrend(statsFilters, timezone),
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

            useOneTicketsTrendMock.mockImplementation(() => mockData)
            useClosedTicketsTrendMock.mockImplementation(
                () => mockClosedTicketsPerAgent,
            )

            const { result } = renderHook(() =>
                useOneTouchTicketsPercentageMetricTrend(statsFilters, timezone),
            )

            expect(result?.current?.data?.value).toBe(null)
            expect(result?.current?.data?.prevValue).toBe(null)
            expect(result.current.isFetching).toBe(false)
            expect(result.current.isError).toBe(false)
        })
    })

    describe('fetchOneTouchTicketsPercentageMetricTrend', () => {
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

            fetchOneTicketsTrendMock.mockResolvedValue(mockData)
            fetchClosedTicketsTrendMock.mockResolvedValue(
                mockClosedTicketsPerAgent,
            )

            const result = await fetchOneTouchTicketsPercentageMetricTrend(
                statsFilters,
                timezone,
            )

            expect(result?.data?.value).toBe(25)
            expect(result?.data?.prevValue).toBe(30)
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

            fetchOneTicketsTrendMock.mockResolvedValue(mockData)
            fetchClosedTicketsTrendMock.mockResolvedValue(
                mockClosedTicketsPerAgent,
            )

            const result = await fetchOneTouchTicketsPercentageMetricTrend(
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

            fetchOneTicketsTrendMock.mockRejectedValue(mockData)
            fetchClosedTicketsTrendMock.mockRejectedValue(
                mockClosedTicketsPerAgent,
            )

            const result = await fetchOneTouchTicketsPercentageMetricTrend(
                statsFilters,
                timezone,
            )

            expect(result?.data).toBe(undefined)
            expect(result.isFetching).toBe(false)
            expect(result.isError).toBe(true)
        })
    })
})
