import { assumeMock, renderHook } from '@repo/testing'

import { useSupportInteractionsTotal } from 'domains/reporting/hooks/ai-agent-insights/supportInteractionsMetrics'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useAiAgentSupportInteractionsMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportInteractionsMetric'
import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

jest.mock(
    'domains/reporting/hooks/ai-agent-insights/supportInteractionsMetrics',
)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/utils/reporting')
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)

const mockUseSupportInteractionsTotal = assumeMock(useSupportInteractionsTotal)
const mockUseStatsFilters = assumeMock(useStatsFilters)
const mockGetPreviousPeriod = assumeMock(getPreviousPeriod)
const mockUseGetCustomTicketsFieldsDefinitionData = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)

describe('useAiAgentSupportInteractionsMetric', () => {
    const mockFilters = {
        period: {
            start_datetime: '2024-01-01T00:00:00Z',
            end_datetime: '2024-01-31T23:59:59Z',
        },
    }

    const mockPreviousPeriod = {
        start_datetime: '2023-12-01T00:00:00Z',
        end_datetime: '2023-12-31T23:59:59Z',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: mockFilters,
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)

        mockGetPreviousPeriod.mockReturnValue(mockPreviousPeriod)

        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            outcomeCustomFieldId: 123,
            intentCustomFieldId: 456,
        } as any)
    })

    it('should return correct data when both queries succeed', () => {
        mockUseSupportInteractionsTotal
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 100 },
            } as any)
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 80 },
            } as any)

        const { result } = renderHook(() =>
            useAiAgentSupportInteractionsMetric(),
        )

        expect(result.current.isFetching).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.isFieldsAvailable).toBe(true)
        expect(result.current.data).toEqual({
            label: 'Automated interactions',
            value: 100,
            prevValue: 80,
        })
    })

    it('should return isFetching true when current period is fetching', () => {
        mockUseSupportInteractionsTotal
            .mockReturnValueOnce({
                isFetching: true,
                isError: false,
                data: undefined,
            } as any)
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 80 },
            } as any)

        const { result } = renderHook(() =>
            useAiAgentSupportInteractionsMetric(),
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isFetching true when previous period is fetching', () => {
        mockUseSupportInteractionsTotal
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 100 },
            } as any)
            .mockReturnValueOnce({
                isFetching: true,
                isError: false,
                data: undefined,
            } as any)

        const { result } = renderHook(() =>
            useAiAgentSupportInteractionsMetric(),
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError true when current period has error', () => {
        mockUseSupportInteractionsTotal
            .mockReturnValueOnce({
                isFetching: false,
                isError: true,
                data: undefined,
            } as any)
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 80 },
            } as any)

        const { result } = renderHook(() =>
            useAiAgentSupportInteractionsMetric(),
        )

        expect(result.current.isError).toBe(true)
    })

    it('should return isError true when previous period has error', () => {
        mockUseSupportInteractionsTotal
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 100 },
            } as any)
            .mockReturnValueOnce({
                isFetching: false,
                isError: true,
                data: undefined,
            } as any)

        const { result } = renderHook(() =>
            useAiAgentSupportInteractionsMetric(),
        )

        expect(result.current.isError).toBe(true)
    })

    it('should return null values when data is not available', () => {
        mockUseSupportInteractionsTotal.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        } as any)

        const { result } = renderHook(() =>
            useAiAgentSupportInteractionsMetric(),
        )

        expect(result.current.data?.value).toBeNull()
        expect(result.current.data?.prevValue).toBeNull()
    })

    it('should return isFieldsAvailable false when outcomeCustomFieldId is not available', () => {
        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            outcomeCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            intentCustomFieldId: 456,
        } as any)

        mockUseSupportInteractionsTotal.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 100 },
        } as any)

        const { result } = renderHook(() =>
            useAiAgentSupportInteractionsMetric(),
        )

        expect(result.current.isFieldsAvailable).toBe(false)
    })

    it('should return isFieldsAvailable false when intentCustomFieldId is not available', () => {
        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            outcomeCustomFieldId: 123,
            intentCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
        } as any)

        mockUseSupportInteractionsTotal.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 100 },
        } as any)

        const { result } = renderHook(() =>
            useAiAgentSupportInteractionsMetric(),
        )

        expect(result.current.isFieldsAvailable).toBe(false)
    })

    it('should call useSupportInteractionsTotal with correct parameters for current period', () => {
        mockUseSupportInteractionsTotal.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 100 },
        } as any)

        renderHook(() => useAiAgentSupportInteractionsMetric())

        expect(mockUseSupportInteractionsTotal).toHaveBeenCalledWith(
            mockFilters,
            'UTC',
            123,
            456,
        )
    })

    it('should call useSupportInteractionsTotal with previous period filters', () => {
        mockUseSupportInteractionsTotal.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 100 },
        } as any)

        renderHook(() => useAiAgentSupportInteractionsMetric())

        expect(mockUseSupportInteractionsTotal).toHaveBeenCalledWith(
            { ...mockFilters, period: mockPreviousPeriod },
            'UTC',
            123,
            456,
        )
    })

    it('should call getPreviousPeriod with current period', () => {
        mockUseSupportInteractionsTotal.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 100 },
        } as any)

        renderHook(() => useAiAgentSupportInteractionsMetric())

        expect(mockGetPreviousPeriod).toHaveBeenCalledWith(mockFilters.period)
    })

    it('should return correct label in data', () => {
        mockUseSupportInteractionsTotal.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 100 },
        } as any)

        const { result } = renderHook(() =>
            useAiAgentSupportInteractionsMetric(),
        )

        expect(result.current.data?.label).toBe('Automated interactions')
    })
})
