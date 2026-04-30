import { useFlagWithLoading } from '@repo/feature-flags'
import { getPreviousUrl } from '@repo/routing'
import { render } from '@repo/testing'
import { QueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'
import { FilterKey } from 'domains/reporting/models/stat/types'

import { useExportAiAgentAllAgentsToCSV } from '../../hooks/useExportAiAgentAllAgentsToCSV'
import { useExportAiAgentShoppingAssistantToCSV } from '../../hooks/useExportAiAgentShoppingAssistantToCSV'
import { useExportAiAgentSupportAgentToCSV } from '../../hooks/useExportAiAgentSupportAgentToCSV'
import { AnalyticsAiAgentLayout } from '../AnalyticsAiAgentLayout'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(),
}))

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
jest.mock(
    'pages/aiAgent/analyticsOverview/components/DashboardExportButton/DashboardExportButton',
    () => ({
        DashboardExportButton: () => (
            <div data-testid="download-button">Download</div>
        ),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardLayoutRenderer',
    () => ({
        DashboardLayoutRenderer: ({ reportConfig }: any) => (
            <div data-testid="dashboard-renderer">
                {reportConfig?.reportName || 'Dashboard'}
            </div>
        ),
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
    default: jest.fn(),
}))

const mockedUseFlagWithLoading = jest.mocked(useFlagWithLoading)
const mockFiltersPanelWrapper = jest.requireMock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper',
).default as jest.Mock

const mockedGetPreviousUrl = jest.mocked(getPreviousUrl)
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

        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

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
    it('should render dashboard renderer for shopping-assistant tab', () => {
        renderComponent('/app/stats/ai-agent?ai-agent-tab=shopping-assistant')
        expect(screen.getByTestId('dashboard-renderer')).toBeInTheDocument()
    })
    it('should render nothing for an unknown tab value', () => {
        renderComponent('/app/stats/ai-agent?ai-agent-tab=unknown-tab')
        expect(
            screen.queryByTestId('dashboard-renderer'),
        ).not.toBeInTheDocument()
    })

    it('passes optional filters to FiltersPanelWrapper when flag is enabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        renderComponent()

        expect(mockFiltersPanelWrapper).toHaveBeenCalledWith(
            expect.objectContaining({
                optionalFilters: [FilterKey.Stores, FilterKey.Channels],
            }),
            expect.anything(),
        )
    })

    it('passes empty optionalFilters to FiltersPanelWrapper when flag is disabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        renderComponent()

        expect(mockFiltersPanelWrapper).toHaveBeenCalledWith(
            expect.objectContaining({ optionalFilters: [] }),
            expect.anything(),
        )
    })

    it('passes empty optionalFilters to FiltersPanelWrapper while flag is loading', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: true,
        })

        renderComponent()

        expect(mockFiltersPanelWrapper).toHaveBeenCalledWith(
            expect.objectContaining({ optionalFilters: [] }),
            expect.anything(),
        )
    })
})
