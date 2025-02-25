import { renderHook } from '@testing-library/react-hooks'

import {
    fetchClosedTicketsTrend,
    fetchZeroTouchTicketsTrend,
    useClosedTicketsTrend,
    useZeroTouchTicketsTrend,
} from 'hooks/reporting/metricTrends'
import {
    fetchZeroTouchTicketsPercentageMetricTrend,
    useZeroTouchTicketsPercentageMetricTrend,
} from 'hooks/reporting/support-performance/agents/useZeroTouchTicketsPercentageMetricTrend'
import { StatsFilters } from 'models/stat/types'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/metricTrends')
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
                useZeroTouchTicketsPercentageMetricTrend(
                    statsFilters,
                    timezone,
                ),
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

            useZeroTicketsTrendMock.mockReturnValue(mockData)
            useClosedTicketsTrendMock.mockReturnValue(mockClosedTicketsPerAgent)

            const { result } = renderHook(() =>
                useZeroTouchTicketsPercentageMetricTrend(
                    statsFilters,
                    timezone,
                ),
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
                useZeroTouchTicketsPercentageMetricTrend(
                    statsFilters,
                    timezone,
                ),
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

            const result = await fetchZeroTouchTicketsPercentageMetricTrend(
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

            fetchZeroTicketsTrendMock.mockResolvedValue(mockData)
            fetchClosedTicketsTrendMock.mockResolvedValue(
                mockClosedTicketsPerAgent,
            )

            const result = await fetchZeroTouchTicketsPercentageMetricTrend(
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

            const result = await fetchZeroTouchTicketsPercentageMetricTrend(
                statsFilters,
                timezone,
            )

            expect(result?.data).toBe(undefined)
            expect(result.isFetching).toBe(false)
            expect(result.isError).toBe(true)
        })
    })
})
