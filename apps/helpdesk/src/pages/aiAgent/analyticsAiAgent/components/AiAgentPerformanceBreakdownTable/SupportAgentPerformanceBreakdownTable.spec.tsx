import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import * as useIntentPerformanceMetricsModule from 'pages/aiAgent/analyticsAiAgent/hooks/useIntentPerformanceMetrics'
import * as useSupportAgentChannelPerformanceMetricsModule from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentChannelPerformanceMetrics'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

import { SupportAgentPerformanceBreakdownTable } from './SupportAgentPerformanceBreakdownTable'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentChannelPerformanceMetrics',
)
jest.mock('pages/aiAgent/analyticsAiAgent/hooks/useIntentPerformanceMetrics')
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')

const mockUseStatsFilters = useStatsFilters as jest.MockedFunction<
    typeof useStatsFilters
>
const mockUseSupportAgentChannelPerformanceMetrics =
    useSupportAgentChannelPerformanceMetricsModule.useSupportAgentChannelPerformanceMetrics as jest.MockedFunction<
        typeof useSupportAgentChannelPerformanceMetricsModule.useSupportAgentChannelPerformanceMetrics
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

describe('SupportAgentPerformanceBreakdownTable', () => {
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

        mockUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
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
        render(<SupportAgentPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        expect(screen.getByText('Performance breakdown')).toBeInTheDocument()
    })

    it('should render tab buttons for Channel and Intent', () => {
        render(<SupportAgentPerformanceBreakdownTable />, {
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
        render(<SupportAgentPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        const channelButton = screen.getByRole('radio', { name: /Channel/i })
        expect(channelButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should render a table', () => {
        render(<SupportAgentPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        const table = screen.getByRole('table')
        expect(table).toBeInTheDocument()
    })

    it('should render Channel table headers without Shopping Assistant columns', () => {
        render(<SupportAgentPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        expect(screen.getByText('Handover interactions')).toBeInTheDocument()
        expect(screen.getByText('Snoozed interactions')).toBeInTheDocument()
        expect(screen.queryByText('Total sales')).not.toBeInTheDocument()
        expect(
            screen.queryByText('% automated by Shopping assistant'),
        ).not.toBeInTheDocument()
    })
})
