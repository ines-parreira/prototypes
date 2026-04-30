import type React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { useMetric } from 'domains/reporting/hooks/useMetric'
import { aiAgentTouchedTicketTotalCountQueryFactory } from 'domains/reporting/models/queryFactories/ai-agent-insights/metrics'
import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import useAppSelector from 'hooks/useAppSelector'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import { useTotalCoveredAiAgentTickets } from './useTotalCoveredAiAgentTickets'

jest.mock('domains/reporting/hooks/useMetric')
jest.mock('domains/reporting/models/queryFactories/ai-agent-insights/metrics')
jest.mock('hooks/integrations/useGetTicketChannelsStoreIntegrations')
jest.mock('hooks/useAppSelector')
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')

const mockUseMetric = useMetric as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseGetCustomTicketsFieldsDefinitionData =
    useGetCustomTicketsFieldsDefinitionData as jest.Mock
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockUseGetTicketChannelsStoreIntegrations =
    useGetTicketChannelsStoreIntegrations as jest.Mock
const mockAiAgentTouchedTicketTotalCountQueryFactory =
    aiAgentTouchedTicketTotalCountQueryFactory as jest.Mock

describe('useTotalCoveredAiAgentTickets', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })

    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                storeName: 'test-store',
            },
        })

        mockUseAppSelector.mockReturnValue('America/New_York')

        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            intentCustomFieldId: 123,
            outcomeCustomFieldId: 456,
        })

        mockUseGetTicketChannelsStoreIntegrations.mockReturnValue([1, 2, 3])

        mockAiAgentTouchedTicketTotalCountQueryFactory.mockReturnValue({
            measures: ['count'],
            filters: [],
        })
    })

    it('should return total count when data is available', async () => {
        mockUseMetric.mockReturnValue({
            data: { value: 150 },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useTotalCoveredAiAgentTickets(), {
            wrapper,
        })

        await waitFor(() => {
            expect(result.current.totalCount).toBe(150)
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should return 0 when no data available', async () => {
        mockUseMetric.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useTotalCoveredAiAgentTickets(), {
            wrapper,
        })

        await waitFor(() => {
            expect(result.current.totalCount).toBe(0)
        })
    })

    it('should handle loading state', () => {
        mockUseMetric.mockReturnValue({
            data: undefined,
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() => useTotalCoveredAiAgentTickets(), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)
    })

    it('should handle error state', () => {
        mockUseMetric.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(() => useTotalCoveredAiAgentTickets(), {
            wrapper,
        })

        expect(result.current.isError).toBe(true)
    })

    it('should call aiAgentTouchedTicketTotalCountQueryFactory with correct parameters', () => {
        mockUseMetric.mockReturnValue({
            data: { value: 100 },
            isFetching: false,
            isError: false,
        })

        const dateRange = getLast28DaysDateRange()

        renderHook(() => useTotalCoveredAiAgentTickets(), { wrapper })

        expect(
            mockAiAgentTouchedTicketTotalCountQueryFactory,
        ).toHaveBeenCalledWith({
            filters: {
                period: dateRange,
            },
            timezone: 'America/New_York',
            intentFieldId: 123,
            outcomeFieldId: 456,
            integrationIds: [1, 2, 3],
        })
    })

    it('should use UTC timezone when timezone is null', () => {
        mockUseAppSelector.mockReturnValue(null)

        mockUseMetric.mockReturnValue({
            data: { value: 100 },
            isFetching: false,
            isError: false,
        })

        renderHook(() => useTotalCoveredAiAgentTickets(), { wrapper })

        expect(
            mockAiAgentTouchedTicketTotalCountQueryFactory,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                timezone: 'UTC',
            }),
        )
    })

    it('should disable the query when intentCustomFieldId is falsy', () => {
        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            intentCustomFieldId: 0,
            outcomeCustomFieldId: 456,
        })

        mockUseMetric.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })

        renderHook(() => useTotalCoveredAiAgentTickets(), { wrapper })

        expect(mockUseMetric).toHaveBeenCalledWith(
            expect.anything(),
            undefined,
            false,
        )
    })

    it('should disable the query when outcomeCustomFieldId is falsy', () => {
        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            intentCustomFieldId: 123,
            outcomeCustomFieldId: 0,
        })

        mockUseMetric.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })

        renderHook(() => useTotalCoveredAiAgentTickets(), { wrapper })

        expect(mockUseMetric).toHaveBeenCalledWith(
            expect.anything(),
            undefined,
            false,
        )
    })
})
