import { assumeMock, render } from '@repo/testing'
import { QueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'

import { ThemeProvider } from 'core/theme'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { PerformanceOverviewReport } from 'domains/reporting/pages/performance/overview/PerformanceOverviewReport'

jest.mock('domains/reporting/hooks/useCleanStatsFilters', () => ({
    useCleanStatsFilters: jest.fn(),
}))
jest.mock(
    'domains/reporting/pages/performance/overview/hooks/useExportPerformanceOverviewToCSV',
    () => ({
        useExportPerformanceOverviewToCSV: jest.fn(),
    }),
)
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    DashboardExportButton: () => <div>DashboardExportButton</div>,
    DashboardLayoutRenderer: () => <div>DashboardLayoutRenderer</div>,
}))
jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
    () => ({
        __esModule: true,
        FiltersPanelWrapper: jest.fn(() => <div>FiltersPanelWrapper</div>),
    }),
)
jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => <div>DrillDownModal</div>,
}))

const mockFiltersPanelWrapper = assumeMock(FiltersPanelWrapper)

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const renderComponent = () =>
    render(
        <ThemeProvider>
            <PerformanceOverviewReport />
        </ThemeProvider>,
        {
            initialEntries: ['/app/stats/performance/overview'],
        },
    )

describe('PerformanceOverviewReport', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('renders the report heading', () => {
        renderComponent()
        expect(screen.getByText('Performance')).toBeInTheDocument()
    })

    it('renders the export button', () => {
        renderComponent()
        expect(screen.getByText('DashboardExportButton')).toBeInTheDocument()
    })

    it('renders the filters panel', () => {
        renderComponent()
        expect(screen.getByText('FiltersPanelWrapper')).toBeInTheDocument()
    })

    it('renders the dashboard layout renderer', () => {
        renderComponent()
        expect(screen.getByText('DashboardLayoutRenderer')).toBeInTheDocument()
    })

    it('passes a 365-day max span override for the period filter', () => {
        renderComponent()

        expect(mockFiltersPanelWrapper).toHaveBeenCalledWith(
            expect.objectContaining({
                filterSettingsOverrides: expect.objectContaining({
                    [FilterKey.Period]: {
                        initialSettings: { maxSpan: 365 },
                    },
                }),
                withSavedFilters: false,
                compact: true,
            }),
            expect.anything(),
        )
    })
})
