import type { MetricTrend } from '@repo/reporting'
import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchCoverageRateTrend,
    useCoverageRateTrend,
} from 'domains/reporting/hooks/automate/useCoverageRateTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchCustomTicketsFieldsDefinitionData,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import {
    fetchAllTickets,
    useAllTickets,
} from 'pages/aiAgent/Overview/hooks/kpis/useAllTickets'

jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
jest.mock('pages/aiAgent/Overview/hooks/kpis/useAllTickets')
jest.mock('domains/reporting/hooks/useMetricTrend')

const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)
const fetchCustomTicketsFieldsDefinitionDataMock = assumeMock(
    fetchCustomTicketsFieldsDefinitionData,
)
const useAllTicketsMock = assumeMock(useAllTickets)
const fetchAllTicketsMock = assumeMock(fetchAllTickets)
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('CoverageRateTrend', () => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00.000',
            end_datetime: '2021-06-04T23:59:59.000',
        },
    }
    const timezone = 'UTC'
    const outcomeCustomFieldId = 42

    const allTicketsData: MetricTrend = {
        data: { label: 'allTickets', value: 100, prevValue: 50 },
        isFetching: false,
        isError: false,
    }

    const aiAgentTicketsData: MetricTrend = {
        data: { label: 'aiAgentTickets', value: 30, prevValue: 10 },
        isFetching: false,
        isError: false,
    }

    describe('useCoverageRateTrend', () => {
        beforeEach(() => {
            useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
                outcomeCustomFieldId,
                intentCustomFieldId: -1,
                sentimentCustomFieldId: null,
            })
            useAllTicketsMock.mockReturnValue(allTicketsData)
            useMetricTrendMock.mockReturnValue(aiAgentTicketsData)
        })

        it('should calculate coverage rate as ratio of AI agent tickets to all tickets', () => {
            const { result } = renderHook(() =>
                useCoverageRateTrend(statsFilters, timezone),
            )

            expect(result.current).toEqual({
                data: {
                    value: 0.3, // 30 / 100
                    prevValue: 0.2, // 10 / 50
                },
                isFetching: false,
                isError: false,
            })
        })

        it('should return 0 when all tickets count is zero', () => {
            useAllTicketsMock.mockReturnValue({
                data: { value: 0, prevValue: 0 },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useCoverageRateTrend(statsFilters, timezone),
            )

            expect(result.current).toEqual({
                data: {
                    value: 0,
                    prevValue: 0,
                },
                isFetching: false,
                isError: false,
            })
        })

        it('should propagate isFetching when all tickets are loading', () => {
            useAllTicketsMock.mockReturnValue({
                data: undefined,
                isFetching: true,
                isError: false,
            })

            const { result } = renderHook(() =>
                useCoverageRateTrend(statsFilters, timezone),
            )

            expect(result.current.isFetching).toBe(true)
        })

        it('should propagate isFetching when AI agent tickets are loading', () => {
            useMetricTrendMock.mockReturnValue({
                data: undefined,
                isFetching: true,
                isError: false,
            })

            const { result } = renderHook(() =>
                useCoverageRateTrend(statsFilters, timezone),
            )

            expect(result.current.isFetching).toBe(true)
        })

        it('should propagate isError when all tickets have an error', () => {
            useAllTicketsMock.mockReturnValue({
                data: undefined,
                isFetching: false,
                isError: true,
            })

            const { result } = renderHook(() =>
                useCoverageRateTrend(statsFilters, timezone),
            )

            expect(result.current.isError).toBe(true)
        })

        it('should return undefined data when any metric has no data yet', () => {
            useAllTicketsMock.mockReturnValue({
                data: undefined,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useCoverageRateTrend(statsFilters, timezone),
            )

            expect(result.current.data).toBeUndefined()
        })
    })

    describe('fetchCoverageRateTrend', () => {
        beforeEach(() => {
            fetchCustomTicketsFieldsDefinitionDataMock.mockResolvedValue({
                outcomeCustomFieldId,
                intentCustomFieldId: -1,
                sentimentCustomFieldId: null,
            })
            fetchAllTicketsMock.mockResolvedValue(allTicketsData)
            fetchMetricTrendMock.mockResolvedValue(aiAgentTicketsData)
        })

        it('should calculate coverage rate as ratio of AI agent tickets to all tickets', async () => {
            const result = await fetchCoverageRateTrend(statsFilters, timezone)

            expect(result).toEqual({
                data: {
                    value: 0.3, // 30 / 100
                    prevValue: 0.2, // 10 / 50
                },
                isFetching: false,
                isError: false,
            })
        })

        it('should return 0 when all tickets count is zero', async () => {
            fetchAllTicketsMock.mockResolvedValue({
                data: { value: 0, prevValue: 0 },
                isFetching: false,
                isError: false,
            })

            const result = await fetchCoverageRateTrend(statsFilters, timezone)

            expect(result).toEqual({
                data: {
                    value: 0,
                    prevValue: 0,
                },
                isFetching: false,
                isError: false,
            })
        })

        it('should return isError=true on fetch failure', async () => {
            fetchAllTicketsMock.mockRejectedValue(new Error('Network error'))

            const result = await fetchCoverageRateTrend(statsFilters, timezone)

            expect(result).toEqual({
                data: undefined,
                isFetching: false,
                isError: true,
            })
        })
    })
})
