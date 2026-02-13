import { getPreviousUrl } from '@repo/routing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import configureMockStore from 'redux-mock-store'

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

jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
    () => {
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
            FiltersPanelWrapper: MockFiltersPanelWrapper,
        }
    },
)

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => <div data-testid="drill-down-modal" />,
}))

jest.mock('hooks/candu/useInjectStyleToCandu', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const mockedGetPreviousUrl = jest.mocked(getPreviousUrl)
const mockedUseExportAnalyticsOverviewToCSV = jest.mocked(
    useExportAnalyticsOverviewToCSV,
)

const mockStore = configureMockStore()
const store = mockStore({
    currentAccount: fromJS({ domain: 'test-domain' }),
})

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const renderComponent = (initialRoute = '/app/stats/overview') => {
    return render(
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <MemoryRouter initialEntries={[initialRoute]}>
                        <AnalyticsOverviewLayout />
                    </MemoryRouter>
                </ThemeProvider>
            </QueryClientProvider>
        </Provider>,
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
