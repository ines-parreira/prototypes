import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import * as useChannelPerformanceMetricsModule from 'pages/aiAgent/analyticsAiAgent/hooks/useChannelPerformanceMetrics'
import * as useIntentPerformanceMetricsModule from 'pages/aiAgent/analyticsAiAgent/hooks/useIntentPerformanceMetrics'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

import { AllAgentsPerformanceBreakdownTable } from './AllAgentsPerformanceBreakdownTable'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('pages/aiAgent/analyticsAiAgent/hooks/useChannelPerformanceMetrics')
jest.mock('pages/aiAgent/analyticsAiAgent/hooks/useIntentPerformanceMetrics')
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')

const mockUseStatsFilters = useStatsFilters as jest.MockedFunction<
    typeof useStatsFilters
>
const mockUseChannelPerformanceMetrics =
    useChannelPerformanceMetricsModule.useChannelPerformanceMetrics as jest.MockedFunction<
        typeof useChannelPerformanceMetricsModule.useChannelPerformanceMetrics
    >
const mockUseIntentPerformanceMetrics =
    useIntentPerformanceMetricsModule.useIntentPerformanceMetrics as jest.MockedFunction<
        typeof useIntentPerformanceMetricsModule.useIntentPerformanceMetrics
    >
const mockUseGetCustomTicketsFieldsDefinitionData =
    useGetCustomTicketsFieldsDefinitionData as jest.MockedFunction<
        typeof useGetCustomTicketsFieldsDefinitionData
    >
const mockUseMoneySavedPerInteractionWithAutomate =
    useMoneySavedPerInteractionWithAutomate as jest.MockedFunction<
        typeof useMoneySavedPerInteractionWithAutomate
    >

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('AllAgentsPerformanceBreakdownTable', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                startDate: '2024-01-01',
                endDate: '2024-01-31',
            },
            userTimezone: 'UTC',
        } as any)

        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            intentCustomFieldId: 5253,
            outcomeCustomFieldId: 5254,
            sentimentCustomFieldId: null,
        })

        mockUseMoneySavedPerInteractionWithAutomate.mockReturnValue(10)

        mockUseChannelPerformanceMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                totalSales: false,
                automationRate: false,
            },
        })

        mockUseIntentPerformanceMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                successRate: false,
                costSaved: false,
            },
        })
    })

    it('should render the component with heading', () => {
        render(<AllAgentsPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        expect(screen.getByText('Performance breakdown')).toBeInTheDocument()
    })

    it('should render tab buttons for Channel and Intent', () => {
        render(<AllAgentsPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        expect(
            screen.getByRole('radio', { name: /Channel/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: /Intent/i }),
        ).toBeInTheDocument()
    })

    it('should default to Channel tab', () => {
        render(<AllAgentsPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        const channelButton = screen.getByRole('radio', { name: /Channel/i })
        expect(channelButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should render a table', () => {
        render(<AllAgentsPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        const table = screen.getByRole('table')
        expect(table).toBeInTheDocument()
    })
})
