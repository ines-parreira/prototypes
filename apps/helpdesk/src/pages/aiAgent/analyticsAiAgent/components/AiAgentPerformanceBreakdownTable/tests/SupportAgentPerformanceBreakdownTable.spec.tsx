import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import * as useIntentPerformanceMetricsModule from 'pages/aiAgent/analyticsAiAgent/hooks/useIntentPerformanceMetrics'
import * as useSupportAgentChannelPerformanceMetricsModule from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentChannelPerformanceMetrics'
import { useAiAgentAnalyticsDashboardTracking } from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

import { SupportAgentPerformanceBreakdownTable } from '../SupportAgentPerformanceBreakdownTable'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentChannelPerformanceMetrics',
)
jest.mock('pages/aiAgent/analyticsAiAgent/hooks/useIntentPerformanceMetrics')
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
jest.mock('pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking')
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
const mockUseAiAgentAnalyticsDashboardTracking =
    useAiAgentAnalyticsDashboardTracking as jest.MockedFunction<
        typeof useAiAgentAnalyticsDashboardTracking
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
    const mockOnTableTabInteraction = jest.fn()

    beforeAll(() => {
        // Mock getAnimations for jsdom
        Element.prototype.getAnimations = jest.fn(() => [])
    })

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
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
            data: [
                {
                    channel: 'chat',
                    handoverInteractions: 100,
                    snoozedInteractions: 20,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        mockUseIntentPerformanceMetrics.mockReturnValue({
            data: [
                {
                    intentL1: 'Order',
                    intentL2: 'Status',
                    handoverInteractions: 50,
                    snoozedInteractions: 10,
                    successRate: 80,
                    costSaved: 500,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                successRate: false,
                costSaved: false,
            },
        })

        mockUseAiAgentAnalyticsDashboardTracking.mockReturnValue({
            onTableTabInteraction: mockOnTableTabInteraction,
            onAnalyticsReportViewed: jest.fn(),
            onAnalyticsAiAgentTabSelected: jest.fn(),
            onExport: jest.fn(),
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

    describe('handleSelectionChange', () => {
        it('should call onTableTabInteraction when switching to Intent tab', async () => {
            const user = userEvent.setup()
            render(<SupportAgentPerformanceBreakdownTable />, {
                wrapper: createWrapper(),
            })

            const intentButton = screen.getByRole('radio', { name: /Intent/i })

            await act(() => user.click(intentButton))

            expect(mockOnTableTabInteraction).toHaveBeenCalledWith({
                reportName: 'analytics-ai-agent/support-agent',
                tableTab: 'Intent',
            })
            expect(mockOnTableTabInteraction).toHaveBeenCalledTimes(1)
        })

        it('should call onTableTabInteraction when switching to Channel tab', async () => {
            const user = userEvent.setup()
            render(<SupportAgentPerformanceBreakdownTable />, {
                wrapper: createWrapper(),
            })

            const intentButton = screen.getByRole('radio', { name: /Intent/i })
            const channelButton = screen.getByRole('radio', {
                name: /Channel/i,
            })

            await act(() => user.click(intentButton))

            expect(mockOnTableTabInteraction).toHaveBeenCalledWith({
                reportName: 'analytics-ai-agent/support-agent',
                tableTab: 'Intent',
            })

            await act(() => user.click(channelButton))

            expect(mockOnTableTabInteraction).toHaveBeenCalledWith({
                reportName: 'analytics-ai-agent/support-agent',
                tableTab: 'Channel',
            })
            expect(mockOnTableTabInteraction).toHaveBeenCalledTimes(2)
        })

        it('should update active tab state when switching tabs', async () => {
            const user = userEvent.setup()
            render(<SupportAgentPerformanceBreakdownTable />, {
                wrapper: createWrapper(),
            })

            const intentButton = screen.getByRole('radio', { name: /Intent/i })
            const channelButton = screen.getByRole('radio', {
                name: /Channel/i,
            })

            expect(channelButton).toHaveAttribute('aria-checked', 'true')
            expect(intentButton).toHaveAttribute('aria-checked', 'false')

            await act(() => user.click(intentButton))

            expect(intentButton).toHaveAttribute('aria-checked', 'true')
            expect(channelButton).toHaveAttribute('aria-checked', 'false')
        })
    })
})
