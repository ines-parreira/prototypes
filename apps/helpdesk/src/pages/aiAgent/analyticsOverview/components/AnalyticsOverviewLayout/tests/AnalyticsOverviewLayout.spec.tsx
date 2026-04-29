import { getPreviousUrl } from '@repo/routing'
import { render } from '@repo/testing'
import { QueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'

import { ThemeProvider } from 'core/theme'
import { AnalyticsOverviewLayout } from 'pages/aiAgent/analyticsOverview/components/AnalyticsOverviewLayout/AnalyticsOverviewLayout'
import { useExportAnalyticsOverviewToCSV } from 'pages/aiAgent/analyticsOverview/hooks/useExportAnalyticsOverviewToCSV'

jest.mock('@repo/routing', () => ({
    getPreviousUrl: jest.fn(),
}))
jest.mock('domains/reporting/hooks/useCleanStatsFilters', () => ({
    useCleanStatsFilters: jest.fn(),
}))
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useExportAnalyticsOverviewToCSV',
)
jest.mock('pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking', () => ({
    useAiAgentAnalyticsDashboardTracking: () => ({
        onAnalyticsReportViewed: jest.fn(),
    }),
}))
jest.mock(
    'pages/aiAgent/analyticsOverview/components/DashboardExportButton/DashboardExportButton',
    () => ({
        DashboardExportButton: () => <div>DashboardExportButton</div>,
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardLayoutRenderer',
    () => ({
        DashboardLayoutRenderer: () => <div>DashboardLayoutRenderer</div>,
    }),
)
jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
    () => {
        const React = require('react')
        const MockFiltersPanelWrapper = React.forwardRef(
            (_props: any, ref: any) => <div ref={ref}>FiltersPanelWrapper</div>,
        )
        MockFiltersPanelWrapper.displayName = 'MockFiltersPanelWrapper'
        return {
            __esModule: true,
            FiltersPanelWrapper: MockFiltersPanelWrapper,
        }
    },
)
jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => <div>DrillDownModal</div>,
}))
jest.mock('hooks/candu/useInjectStyleToCandu', () => ({
    __esModule: true,
    default: jest.fn(),
}))
const mockedGetPreviousUrl = jest.mocked(getPreviousUrl)
const mockedUseExportAnalyticsOverviewToCSV = jest.mocked(
    useExportAnalyticsOverviewToCSV,
)
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})
const renderComponent = (initialRoute = '/app/stats/overview') => {
    return render(
        <ThemeProvider>
            <AnalyticsOverviewLayout />
        </ThemeProvider>,
        {
            initialEntries: [initialRoute],
        },
    )
}
describe('AnalyticsOverviewLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        mockedGetPreviousUrl.mockReturnValue('/app/dashboard')
        mockedUseExportAnalyticsOverviewToCSV.mockReturnValue({
            triggerDownload: jest.fn(),
            isLoading: false,
        })
    })
    it('should render the layout with heading', () => {
        renderComponent()
        expect(screen.getByText('Overview')).toBeInTheDocument()
    })
    it('should render download button', () => {
        renderComponent()
        expect(screen.getByText('DashboardExportButton')).toBeInTheDocument()
    })
    it('should render filters panel', () => {
        renderComponent()
        expect(screen.getByText('FiltersPanelWrapper')).toBeInTheDocument()
    })
    it('should render dashboard renderer when config is loaded', () => {
        renderComponent()
        expect(screen.getByText('DashboardLayoutRenderer')).toBeInTheDocument()
    })
    it('should handle previous URL without /app/ prefix', () => {
        mockedGetPreviousUrl.mockReturnValue('https://example.com/other')
        renderComponent()
        expect(screen.getByText('Overview')).toBeInTheDocument()
    })
    it('should handle undefined previous URL', () => {
        mockedGetPreviousUrl.mockReturnValue(undefined as any)
        renderComponent()
        expect(screen.getByText('Overview')).toBeInTheDocument()
    })
})
