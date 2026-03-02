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
            <div>AnalyticsOverviewDownloadButton</div>
        ),
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

        expect(
            screen.getByText('AnalyticsOverviewDownloadButton'),
        ).toBeInTheDocument()
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
