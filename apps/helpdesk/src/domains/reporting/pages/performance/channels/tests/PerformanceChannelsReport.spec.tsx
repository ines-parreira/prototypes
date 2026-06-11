import { assumeMock, render } from '@repo/testing'
import { QueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'

import { ThemeProvider } from 'core/theme'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { PerformanceChannelsReport } from 'domains/reporting/pages/performance/channels/PerformanceChannelsReport'
import { currentAccountHasProduct } from 'state/billing/selectors'

jest.mock('domains/reporting/hooks/useCleanStatsFilters', () => ({
    useCleanStatsFilters: jest.fn(),
}))
jest.mock(
    'domains/reporting/pages/performance/channels/email/hooks/useExportPerformanceChannelsEmailToCSV',
    () => ({
        useExportPerformanceChannelsEmailToCSV: jest.fn(),
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
jest.mock('domains/reporting/pages/voice/VoicePaywall', () => ({
    VoicePaywall: () => <div>VoicePaywall</div>,
}))
jest.mock('state/billing/selectors', () => ({
    ...jest.requireActual('state/billing/selectors'),
    currentAccountHasProduct: jest.fn(() => () => false),
}))

const mockFiltersPanelWrapper = assumeMock(FiltersPanelWrapper)
const mockCurrentAccountHasProduct = assumeMock(currentAccountHasProduct)

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const renderComponent = (initialRoute = '/app/stats/performance-channels') =>
    render(
        <ThemeProvider>
            <PerformanceChannelsReport />
        </ThemeProvider>,
        {
            initialEntries: [initialRoute],
        },
    )

describe('PerformanceChannelsReport', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        mockCurrentAccountHasProduct.mockReturnValue(
            (() => false) as unknown as ReturnType<
                typeof currentAccountHasProduct
            >,
        )
    })

    it('renders the report heading', () => {
        renderComponent()
        expect(screen.getByText('Channels')).toBeInTheDocument()
    })

    it('renders the Email and Voice tabs', () => {
        renderComponent()
        expect(screen.getByRole('tab', { name: /email/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /voice/i })).toBeInTheDocument()
    })

    describe('Email tab (default)', () => {
        it('renders the export button', () => {
            renderComponent()
            expect(
                screen.getByText('DashboardExportButton'),
            ).toBeInTheDocument()
        })

        it('renders the filters panel', () => {
            renderComponent()
            expect(screen.getByText('FiltersPanelWrapper')).toBeInTheDocument()
        })

        it('renders the dashboard layout renderer', () => {
            renderComponent()
            expect(
                screen.getByText('DashboardLayoutRenderer'),
            ).toBeInTheDocument()
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
                    compact: true,
                }),
                expect.anything(),
            )
        })
    })

    describe('Voice tab', () => {
        const voiceRoute = '/app/stats/performance-channels?channels-tab=voice'

        const mockHasVoiceProduct = () =>
            mockCurrentAccountHasProduct.mockReturnValue(
                (() => true) as unknown as ReturnType<
                    typeof currentAccountHasProduct
                >,
            )

        describe('when the account has the Voice product', () => {
            beforeEach(() => {
                mockHasVoiceProduct()
            })

            it('renders the dashboard layout renderer', () => {
                renderComponent(voiceRoute)
                expect(
                    screen.getByText('DashboardLayoutRenderer'),
                ).toBeInTheDocument()
                expect(
                    screen.queryByText('VoicePaywall'),
                ).not.toBeInTheDocument()
            })

            it('renders the export button', () => {
                renderComponent(voiceRoute)
                expect(
                    screen.getByText('DashboardExportButton'),
                ).toBeInTheDocument()
            })

            it('renders the filters panel', () => {
                renderComponent(voiceRoute)
                expect(
                    screen.getByText('FiltersPanelWrapper'),
                ).toBeInTheDocument()
            })
        })

        describe('when the account lacks the Voice product', () => {
            it('renders the Voice paywall', () => {
                renderComponent(voiceRoute)
                expect(screen.getByText('VoicePaywall')).toBeInTheDocument()
                expect(
                    screen.queryByText('DashboardLayoutRenderer'),
                ).not.toBeInTheDocument()
            })

            it('does not render the export button', () => {
                renderComponent(voiceRoute)
                expect(
                    screen.queryByText('DashboardExportButton'),
                ).not.toBeInTheDocument()
            })

            it('does not render the filters panel', () => {
                renderComponent(voiceRoute)
                expect(
                    screen.queryByText('FiltersPanelWrapper'),
                ).not.toBeInTheDocument()
            })
        })
    })
})
