import { assumeMock, renderHook } from '@repo/testing'

import { useSupportInteractionsPerIntent } from 'domains/reporting/hooks/ai-agent-insights/supportInteractionsMetrics'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { useSupportInteractionsByIntent } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportInteractionsByIntent'
import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

jest.mock(
    'domains/reporting/hooks/ai-agent-insights/supportInteractionsMetrics',
)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)

const mockUseSupportInteractionsPerIntent = assumeMock(
    useSupportInteractionsPerIntent,
)
const mockUseStatsFilters = assumeMock(useStatsFilters)
const mockUseGetCustomTicketsFieldsDefinitionData = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)

describe('useSupportInteractionsByIntent', () => {
    const mockFilters = {
        period: {
            start_datetime: '2024-01-01T00:00:00Z',
            end_datetime: '2024-01-31T23:59:59Z',
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: mockFilters,
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)

        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            outcomeCustomFieldId: 123,
            intentCustomFieldId: 456,
        } as any)
    })

    it('should return mapped and sorted chart data when query succeeds', () => {
        mockUseSupportInteractionsPerIntent.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue]:
                            'Order::Status',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 50,
                    },
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue]:
                            'Shipping::Tracking',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 100,
                    },
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue]:
                            'Return::Request',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 75,
                    },
                ],
            },
        } as any)

        const { result } = renderHook(() => useSupportInteractionsByIntent())

        expect(result.current.data).toEqual([
            { name: 'Shipping::Tracking', value: 100 },
            { name: 'Return::Request', value: 75 },
            { name: 'Order::Status', value: 50 },
        ])
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.isFieldsAvailable).toBe(true)
    })

    it('should filter out items with zero value', () => {
        mockUseSupportInteractionsPerIntent.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue]:
                            'Order::Status',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 50,
                    },
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue]:
                            'Empty::Intent',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 0,
                    },
                ],
            },
        } as any)

        const { result } = renderHook(() => useSupportInteractionsByIntent())

        expect(result.current.data).toEqual([
            { name: 'Order::Status', value: 50 },
        ])
    })

    it('should return undefined data when fields are not available', () => {
        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            outcomeCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            intentCustomFieldId: 456,
        } as any)

        mockUseSupportInteractionsPerIntent.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { allData: [] },
        } as any)

        const { result } = renderHook(() => useSupportInteractionsByIntent())

        expect(result.current.data).toBeUndefined()
        expect(result.current.isFieldsAvailable).toBe(false)
    })

    it('should return undefined data when intentCustomFieldId is not available', () => {
        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            outcomeCustomFieldId: 123,
            intentCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
        } as any)

        mockUseSupportInteractionsPerIntent.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { allData: [] },
        } as any)

        const { result } = renderHook(() => useSupportInteractionsByIntent())

        expect(result.current.data).toBeUndefined()
        expect(result.current.isFieldsAvailable).toBe(false)
    })

    it('should return undefined data when allData is not available', () => {
        mockUseSupportInteractionsPerIntent.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        } as any)

        const { result } = renderHook(() => useSupportInteractionsByIntent())

        expect(result.current.data).toBeUndefined()
    })

    it('should return isLoading true when fetching', () => {
        mockUseSupportInteractionsPerIntent.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        } as any)

        const { result } = renderHook(() => useSupportInteractionsByIntent())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isError true when query has error', () => {
        mockUseSupportInteractionsPerIntent.mockReturnValue({
            isFetching: false,
            isError: true,
            data: undefined,
        } as any)

        const { result } = renderHook(() => useSupportInteractionsByIntent())

        expect(result.current.isError).toBe(true)
    })

    it('should call useSupportInteractionsPerIntent with correct parameters', () => {
        mockUseSupportInteractionsPerIntent.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { allData: [] },
        } as any)

        renderHook(() => useSupportInteractionsByIntent())

        expect(mockUseSupportInteractionsPerIntent).toHaveBeenCalledWith(
            mockFilters,
            'UTC',
            123,
            456,
        )
    })

    it('should handle non-numeric values gracefully', () => {
        mockUseSupportInteractionsPerIntent.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue]:
                            'Order::Status',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                            'invalid',
                    },
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue]:
                            'Shipping::Tracking',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 100,
                    },
                ],
            },
        } as any)

        const { result } = renderHook(() => useSupportInteractionsByIntent())

        expect(result.current.data).toEqual([
            { name: 'Shipping::Tracking', value: 100 },
        ])
    })

    it('should return empty array when all items have zero values', () => {
        mockUseSupportInteractionsPerIntent.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue]:
                            'Order::Status',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 0,
                    },
                ],
            },
        } as any)

        const { result } = renderHook(() => useSupportInteractionsByIntent())

        expect(result.current.data).toEqual([])
    })

    it('should sort data in descending order by value', () => {
        mockUseSupportInteractionsPerIntent.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue]:
                            'Low::Intent',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 10,
                    },
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue]:
                            'High::Intent',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 1000,
                    },
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue]:
                            'Medium::Intent',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 100,
                    },
                ],
            },
        } as any)

        const { result } = renderHook(() => useSupportInteractionsByIntent())

        expect(result.current.data?.[0].name).toBe('High::Intent')
        expect(result.current.data?.[1].name).toBe('Medium::Intent')
        expect(result.current.data?.[2].name).toBe('Low::Intent')
    })
})
