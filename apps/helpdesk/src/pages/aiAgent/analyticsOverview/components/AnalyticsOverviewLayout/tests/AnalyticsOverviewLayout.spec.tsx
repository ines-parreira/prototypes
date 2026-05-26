import { getPreviousUrl } from '@repo/routing'
import { render } from '@repo/testing'
import { QueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'

import { ThemeProvider } from 'core/theme'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { STORES_FILTER_AVAILABILITY_DATE } from 'domains/reporting/pages/common/filters/utils'
import { AnalyticsOverviewLayout } from 'pages/aiAgent/analyticsOverview/components/AnalyticsOverviewLayout/AnalyticsOverviewLayout'
import { useExportAnalyticsOverviewToCSV } from 'pages/aiAgent/analyticsOverview/hooks/useExportAnalyticsOverviewToCSV'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

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
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    DashboardExportButton: () => <div>DashboardExportButton</div>,
}))
jest.mock(
    'pages/aiAgent/analyticsOverview/components/AiAgentDashboardLayoutRenderer',
    () => ({
        AiAgentDashboardLayoutRenderer: () => (
            <div>DashboardLayoutRenderer</div>
        ),
    }),
)
jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
    () => {
        const MockFiltersPanelWrapper = jest.fn(() => (
            <div>FiltersPanelWrapper</div>
        ))
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
jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')

const mockFiltersPanelWrapper = jest.requireMock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
).FiltersPanelWrapper as jest.Mock

const mockedGetPreviousUrl = jest.mocked(getPreviousUrl)
const mockedUseAiAgentStatsFilters = jest.mocked(useAiAgentStatsFilters)
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

    it('always passes optional filters to FiltersPanelWrapper', () => {
        renderComponent()

        expect(mockFiltersPanelWrapper).toHaveBeenCalledWith(
            expect.objectContaining({
                optionalFilters: [FilterKey.Stores, FilterKey.Channels],
            }),
            expect.anything(),
        )
    })

    it('passes stores filterSettingsOverrides when period is before availability date', () => {
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

        renderComponent()

        expect(mockFiltersPanelWrapper).toHaveBeenCalledWith(
            expect.objectContaining({
                filterSettingsOverrides: expect.objectContaining({
                    [FilterKey.Stores]: {
                        isDisabled: true,
                        warningMessage:
                            'The store filter will be available in AI Agent Overview starting August 1, 2025.',
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
})
