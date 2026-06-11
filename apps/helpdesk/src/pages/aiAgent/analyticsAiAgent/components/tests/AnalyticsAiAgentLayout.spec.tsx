import { getPreviousUrl } from '@repo/routing'
import { render } from '@repo/testing'
import { QueryClient } from '@tanstack/react-query'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { STORES_FILTER_AVAILABILITY_DATE } from 'domains/reporting/pages/common/filters/utils'
import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

import {
    AiAgentAnalyticsContent,
    DATA_FILTERING_WARNING_MESSAGE,
    DISMISSED_FILTERING_MESSAGE_BANNER,
} from '../../constants'
import { useExportAiAgentAllAgentsToCSV } from '../../hooks/useExportAiAgentAllAgentsToCSV'
import { useExportAiAgentShoppingAssistantToCSV } from '../../hooks/useExportAiAgentShoppingAssistantToCSV'
import { useExportAiAgentSupportAgentToCSV } from '../../hooks/useExportAiAgentSupportAgentToCSV'
import { AnalyticsAiAgentLayout } from '../AnalyticsAiAgentLayout'

jest.mock('@repo/routing', () => ({
    getPreviousUrl: jest.fn(),
    history: {
        replace: jest.fn(),
    },
}))
jest.mock('domains/reporting/hooks/useCleanStatsFilters', () => ({
    useCleanStatsFilters: jest.fn(),
}))
jest.mock('../../hooks/useExportAiAgentAllAgentsToCSV')
jest.mock('../../hooks/useExportAiAgentShoppingAssistantToCSV')
jest.mock('../../hooks/useExportAiAgentSupportAgentToCSV')
const mockOnAnalyticsAiAgentTabSelected = jest.fn()
jest.mock('pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking', () => ({
    useAiAgentAnalyticsDashboardTracking: () => ({
        onAnalyticsReportViewed: jest.fn(),
        onAnalyticsAiAgentTabSelected: mockOnAnalyticsAiAgentTabSelected,
    }),
}))
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    DashboardExportButton: () => (
        <div data-testid="download-button">Download</div>
    ),
}))
jest.mock(
    'pages/aiAgent/analyticsOverview/components/AiAgentDashboardLayoutRenderer',
    () => ({
        AiAgentDashboardLayoutRenderer: ({ reportConfig }: any) => (
            <div data-testid="dashboard-renderer">
                {reportConfig?.reportName || 'Dashboard'}
            </div>
        ),
    }),
)
const mockSalesPaywallMiddlewareRouter = jest.fn(
    (ChildComponent: any) =>
        function SalesPaywallRouter() {
            return <ChildComponent />
        },
)
jest.mock(
    'pages/aiAgent/Overview/middlewares/SalesPaywallMiddlewareRouter',
    () => ({
        SalesPaywallMiddlewareRouter: (Child: any) =>
            mockSalesPaywallMiddlewareRouter(Child),
    }),
)
jest.mock('domains/reporting/pages/common/filters/FiltersPanelWrapper', () => {
    const MockFiltersPanelWrapper = jest.fn(() => (
        <div data-testid="filters-panel">Filters</div>
    ))
    return {
        __esModule: true,
        default: MockFiltersPanelWrapper,
        FiltersPanelWrapper: MockFiltersPanelWrapper,
    }
})
jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => <div data-testid="drill-down-modal" />,
}))
jest.mock('hooks/candu/useInjectStyleToCandu', () => ({
    __esModule: true,
    useInjectStyleToCandu: jest.fn(),
}))
jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')

const mockFiltersPanelWrapper = jest.requireMock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper',
).FiltersPanelWrapper as jest.Mock

const mockedGetPreviousUrl = jest.mocked(getPreviousUrl)
const mockedUseAiAgentStatsFilters = jest.mocked(useAiAgentStatsFilters)
const mockedUseCanUseAiSalesAgent = jest.mocked(useCanUseAiSalesAgent)
const mockedUseExportAiAgentAllAgentsToCSV = jest.mocked(
    useExportAiAgentAllAgentsToCSV,
)
const mockedUseExportAiAgentShoppingAssistantToCSV = jest.mocked(
    useExportAiAgentShoppingAssistantToCSV,
)
const mockedUseExportAiAgentSupportAgentToCSV = jest.mocked(
    useExportAiAgentSupportAgentToCSV,
)
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})
const renderComponent = (initialRoute = '/app/stats/ai-agent') => {
    return render(
        <ThemeProvider>
            <AnalyticsAiAgentLayout />
        </ThemeProvider>,
        {
            initialEntries: [initialRoute],
        },
    )
}
describe('AnalyticsAiAgentLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        localStorage.clear()

        mockedGetPreviousUrl.mockReturnValue('/app/dashboard')
        mockedUseExportAiAgentAllAgentsToCSV.mockReturnValue({
            triggerDownload: jest.fn(),
            isLoading: false,
        })
        mockedUseExportAiAgentShoppingAssistantToCSV.mockReturnValue({
            triggerDownload: jest.fn(),
            isLoading: false,
        })
        mockedUseExportAiAgentSupportAgentToCSV.mockReturnValue({
            triggerDownload: jest.fn(),
            isLoading: false,
        })
        mockedUseCanUseAiSalesAgent.mockReturnValue(true)
        mockedUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: {
                period: {
                    start_datetime: new Date(
                        STORES_FILTER_AVAILABILITY_DATE.getTime() + 86400000,
                    ).toISOString(),
                    end_datetime: new Date(
                        STORES_FILTER_AVAILABILITY_DATE.getTime() + 86400000,
                    ).toISOString(),
                },
            },
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)
    })
    it('should render the layout with heading', () => {
        renderComponent()
        expect(screen.getByText('AI Agent')).toBeInTheDocument()
    })
    it('should render all three tabs', () => {
        renderComponent()
        expect(
            screen.getByRole('tab', { name: /all agents/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('tab', { name: /support agent/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('tab', { name: /shopping assistant/i }),
        ).toBeInTheDocument()
    })
    it('should render download button', () => {
        renderComponent()
        expect(screen.getByTestId('download-button')).toBeInTheDocument()
    })

    it('hides the download button on shopping-assistant tab when user cannot use AI Sales Agent', () => {
        mockedUseCanUseAiSalesAgent.mockReturnValue(false)

        renderComponent('/app/stats/ai-agent?ai-agent-tab=shopping-assistant')

        expect(screen.queryByTestId('download-button')).not.toBeInTheDocument()
    })

    it('renders the download button on shopping-assistant tab when user can use AI Sales Agent', () => {
        mockedUseCanUseAiSalesAgent.mockReturnValue(true)

        renderComponent('/app/stats/ai-agent?ai-agent-tab=shopping-assistant')

        expect(screen.getByTestId('download-button')).toBeInTheDocument()
    })

    it('renders the download button on non shopping-assistant tabs even when user cannot use AI Sales Agent', () => {
        mockedUseCanUseAiSalesAgent.mockReturnValue(false)

        renderComponent('/app/stats/ai-agent?ai-agent-tab=support-agent')

        expect(screen.getByTestId('download-button')).toBeInTheDocument()
    })

    it('should render filters panel', () => {
        renderComponent()
        expect(screen.getByTestId('filters-panel')).toBeInTheDocument()
    })
    it('should render dashboard renderer when config is loaded', () => {
        renderComponent()
        expect(screen.getByTestId('dashboard-renderer')).toBeInTheDocument()
    })
    it('should handle previous URL without /app/ prefix', () => {
        mockedGetPreviousUrl.mockReturnValue('https://example.com/other')
        renderComponent()
        expect(screen.getByText('AI Agent')).toBeInTheDocument()
    })
    it('should handle undefined previous URL', () => {
        mockedGetPreviousUrl.mockReturnValue(undefined as any)
        renderComponent()
        expect(screen.getByText('AI Agent')).toBeInTheDocument()
    })
    it('should call onAnalyticsAiAgentTabSelected when tab is changed', async () => {
        const user = userEvent.setup()
        renderComponent('/app/stats/ai-agent?ai-agent-tab=all-agents')
        await user.click(screen.getByRole('tab', { name: /support agent/i }))
        expect(mockOnAnalyticsAiAgentTabSelected).toHaveBeenCalledWith({
            tabName: 'support-agent',
            previousTab: 'all-agents',
        })
    })
    it('should render dashboard renderer for support-agent tab', () => {
        renderComponent('/app/stats/ai-agent?ai-agent-tab=support-agent')
        expect(screen.getByTestId('dashboard-renderer')).toBeInTheDocument()
    })
    it('should render dashboard renderer for shopping-assistant tab when middleware grants access', () => {
        renderComponent('/app/stats/ai-agent?ai-agent-tab=shopping-assistant')
        expect(screen.getByTestId('dashboard-renderer')).toBeInTheDocument()
        expect(
            within(screen.getByTestId('dashboard-renderer')).getByText(
                'Shopping Assistant',
            ),
        ).toBeInTheDocument()
    })

    it('wraps the shopping-assistant dashboard with SalesPaywallMiddlewareRouter', () => {
        renderComponent('/app/stats/ai-agent?ai-agent-tab=shopping-assistant')
        expect(mockSalesPaywallMiddlewareRouter).toHaveBeenCalledWith(
            expect.any(Function),
        )
    })

    it('renders the paywall and hides the dashboard when SalesPaywallMiddlewareRouter blocks access', () => {
        mockSalesPaywallMiddlewareRouter.mockImplementationOnce(
            () =>
                function SalesPaywallRouter() {
                    return <div>Shopping Assistant Paywall</div>
                },
        )

        renderComponent('/app/stats/ai-agent?ai-agent-tab=shopping-assistant')

        expect(
            screen.getByText('Shopping Assistant Paywall'),
        ).toBeInTheDocument()
        expect(
            screen.queryByTestId('dashboard-renderer'),
        ).not.toBeInTheDocument()
    })

    it('does not invoke SalesPaywallMiddlewareRouter rendering for non shopping-assistant tabs', () => {
        mockSalesPaywallMiddlewareRouter.mockImplementationOnce(
            () =>
                function SalesPaywallRouter() {
                    return <div>Shopping Assistant Paywall</div>
                },
        )
        renderComponent('/app/stats/ai-agent?ai-agent-tab=support-agent')
        expect(screen.getByTestId('dashboard-renderer')).toBeInTheDocument()
        expect(
            screen.queryByText('Shopping Assistant Paywall'),
        ).not.toBeInTheDocument()
    })
    it('should render nothing for an unknown tab value', () => {
        renderComponent('/app/stats/ai-agent?ai-agent-tab=unknown-tab')
        expect(
            screen.queryByTestId('dashboard-renderer'),
        ).not.toBeInTheDocument()
    })

    it('enables saved filters on FiltersPanelWrapper', () => {
        renderComponent()

        expect(mockFiltersPanelWrapper).toHaveBeenCalledWith(
            expect.not.objectContaining({
                withSavedFilters: false,
            }),
            expect.anything(),
        )
    })

    it('always passes optional filters to FiltersPanelWrapper', () => {
        renderComponent()

        expect(mockFiltersPanelWrapper).toHaveBeenCalledWith(
            expect.objectContaining({
                optionalFilters: [FilterKey.Stores, FilterKey.Channels],
            }),
            expect.anything(),
        )
    })

    it('passes stores filterSettingsOverrides for All Agents tab when period is before availability date', () => {
        mockedUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: {
                period: {
                    start_datetime: new Date(
                        STORES_FILTER_AVAILABILITY_DATE.getTime() - 86400000,
                    ).toISOString(),
                    end_datetime: new Date(
                        STORES_FILTER_AVAILABILITY_DATE.getTime() - 86400000,
                    ).toISOString(),
                },
            },
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)

        renderComponent('/app/stats/ai-agent?ai-agent-tab=all-agents')

        expect(mockFiltersPanelWrapper).toHaveBeenCalledWith(
            expect.objectContaining({
                filterSettingsOverrides: expect.objectContaining({
                    [FilterKey.Stores]: {
                        isDisabled: true,
                        warningMessage: `The store filter will be available in AI Agent ${AiAgentAnalyticsContent.AllAgents} starting August 1, 2025.`,
                    },
                }),
            }),
            expect.anything(),
        )
    })

    it('passes tab-specific warningMessage for Support Agent tab when period is before availability date', () => {
        mockedUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: {
                period: {
                    start_datetime: new Date(
                        STORES_FILTER_AVAILABILITY_DATE.getTime() - 86400000,
                    ).toISOString(),
                    end_datetime: new Date(
                        STORES_FILTER_AVAILABILITY_DATE.getTime() - 86400000,
                    ).toISOString(),
                },
            },
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)

        renderComponent('/app/stats/ai-agent?ai-agent-tab=support-agent')

        expect(mockFiltersPanelWrapper).toHaveBeenCalledWith(
            expect.objectContaining({
                filterSettingsOverrides: expect.objectContaining({
                    [FilterKey.Stores]: {
                        isDisabled: true,
                        warningMessage: `The store filter will be available in AI Agent ${AiAgentAnalyticsContent.SupportAgent} starting August 1, 2025.`,
                    },
                }),
            }),
            expect.anything(),
        )
    })

    it('does not pass stores filterSettingsOverrides when period is after availability date', () => {
        renderComponent()

        expect(mockFiltersPanelWrapper).toHaveBeenCalledWith(
            expect.objectContaining({
                filterSettingsOverrides: expect.not.objectContaining({
                    [FilterKey.Stores]: expect.anything(),
                }),
            }),
            expect.anything(),
        )
    })

    it('passes period warningMessage when the data delay banner has been dismissed', () => {
        localStorage.setItem(
            DISMISSED_FILTERING_MESSAGE_BANNER,
            JSON.stringify(true),
        )

        renderComponent()

        expect(mockFiltersPanelWrapper).toHaveBeenCalledWith(
            expect.objectContaining({
                filterSettingsOverrides: expect.objectContaining({
                    [FilterKey.Period]: expect.objectContaining({
                        warningMessage: DATA_FILTERING_WARNING_MESSAGE,
                    }),
                }),
            }),
            expect.anything(),
        )
    })

    it('does not pass period warningMessage when the data delay banner has not been dismissed', () => {
        renderComponent()

        expect(mockFiltersPanelWrapper).toHaveBeenCalledWith(
            expect.objectContaining({
                filterSettingsOverrides: expect.objectContaining({
                    [FilterKey.Period]: expect.objectContaining({
                        warningMessage: undefined,
                    }),
                }),
            }),
            expect.anything(),
        )
    })
})
