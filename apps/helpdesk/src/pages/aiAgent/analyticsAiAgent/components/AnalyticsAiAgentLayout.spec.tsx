import { getPreviousUrl } from '@repo/routing'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { useExportAiAgentAllAgentsToCSV } from '../hooks/useExportAiAgentAllAgentsToCSV'
import { useExportAiAgentShoppingAssistantToCSV } from '../hooks/useExportAiAgentShoppingAssistantToCSV'
import { useExportAiAgentSupportAgentToCSV } from '../hooks/useExportAiAgentSupportAgentToCSV'
import { AnalyticsAiAgentLayout } from './AnalyticsAiAgentLayout'

jest.mock('@repo/routing', () => ({
    getPreviousUrl: jest.fn(),
}))

jest.mock('domains/reporting/hooks/useCleanStatsFilters', () => ({
    useCleanStatsFilters: jest.fn(),
}))

jest.mock('../hooks/useExportAiAgentAllAgentsToCSV')
jest.mock('../hooks/useExportAiAgentShoppingAssistantToCSV')
jest.mock('../hooks/useExportAiAgentSupportAgentToCSV')

jest.mock('pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking', () => ({
    useAiAgentAnalyticsDashboardTracking: () => ({
        onAnalyticsReportViewed: jest.fn(),
        onAnalyticsAiAgentTabSelected: jest.fn(),
    }),
}))

jest.mock(
    'pages/aiAgent/analyticsOverview/components/AnalyticsOverviewDownloadButton/AnalyticsOverviewDownloadButton',
    () => ({
        AnalyticsOverviewDownloadButton: () => (
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
    const React = require('react')
    const MockFiltersPanelWrapper = React.forwardRef(
        (_props: any, ref: any) => (
            <div ref={ref} data-testid="filters-panel">
                Filters
            </div>
        ),
    )
    MockFiltersPanelWrapper.displayName = 'MockFiltersPanelWrapper'
    return {
        __esModule: true,
        default: MockFiltersPanelWrapper,
        FiltersPanelWrapper: MockFiltersPanelWrapper,
    }
})

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

const renderComponent = (initialRoute = '/app/stats/ai-agent') => {
    return render(
        <MemoryRouter initialEntries={[initialRoute]}>
            <AnalyticsAiAgentLayout />
        </MemoryRouter>,
    )
}

describe('AnalyticsAiAgentLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks()

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

    it('should render dashboard renderer', () => {
        renderComponent()

        expect(screen.getByTestId('dashboard-renderer')).toBeInTheDocument()
    })

    it('should default to All Agents tab when no tab param', () => {
        renderComponent('/app/stats/ai-agent')

        expect(
            screen.getByRole('tab', { name: /all agents/i, selected: true }),
        ).toBeInTheDocument()
    })

    it('should select Support Agent tab when tab param is set', () => {
        renderComponent('/app/stats/ai-agent?ai-agent-tab=support-agent')

        expect(
            screen.getByRole('tab', { name: /support agent/i, selected: true }),
        ).toBeInTheDocument()
    })

    it('should select Shopping Assistant tab when tab param is set', () => {
        renderComponent('/app/stats/ai-agent?ai-agent-tab=shopping-assistant')

        expect(
            screen.getByRole('tab', {
                name: /shopping assistant/i,
                selected: true,
            }),
        ).toBeInTheDocument()
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
})
