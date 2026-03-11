import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PerformanceBreakdownTable } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/PerformanceBreakdownTable'
import type {
    FeatureMetrics,
    PerformanceMetricsPerFeature,
} from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'

jest.mock(
    'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/DownloadPerformanceBreakdownButton',
    () => ({
        DownloadPerformanceBreakdownButton: () => <div>Download Button</div>,
    }),
)

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature',
)

const mockUsePerformanceMetricsPerFeature = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature',
).usePerformanceMetricsPerFeature as jest.Mock

const defaultLoadingStates: PerformanceMetricsPerFeature['loadingStates'] = {
    automationRate: false,
    automatedInteractions: false,
    handovers: false,
    timeSaved: false,
    costSaved: false,
}

const defaultData: FeatureMetrics[] = [
    {
        feature: 'AI Agent' as const,
        automationRate: 18,
        automatedInteractions: 2700,
        handoverCount: 189,
        costSaved: 1200,
        timeSaved: 9900,
    },
    {
        feature: 'Flows' as const,
        automationRate: 7,
        automatedInteractions: 900,
        handoverCount: 63,
        costSaved: 500,
        timeSaved: 4500,
    },
    {
        feature: 'Article Recommendation' as const,
        automationRate: 4,
        automatedInteractions: 450,
        handoverCount: 10,
        costSaved: 450,
        timeSaved: 3600,
    },
    {
        feature: 'Order Management' as const,
        automationRate: 3,
        automatedInteractions: 350,
        handoverCount: 5,
        costSaved: 250,
        timeSaved: 1800,
    },
]

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
) => {
    mockUsePerformanceMetricsPerFeature.mockReturnValue({ data, loadingStates })
    return render(<PerformanceBreakdownTable />)
}

describe('PerformanceBreakdownTable', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the table heading', () => {
        renderComponent()

        expect(screen.getByText('Performance breakdown')).toBeInTheDocument()
    })

    it('should render all feature names in table', () => {
        renderComponent()

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(
            screen.getAllByText('Article Recommendation').length,
        ).toBeGreaterThan(0)
        expect(screen.getAllByText('Flows').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Order Management').length).toBeGreaterThan(
            0,
        )
    })

    it('should render table with all column headers', () => {
        renderComponent()

        expect(screen.getByText('Feature')).toBeInTheDocument()
        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
        expect(screen.getByText('Handover interactions')).toBeInTheDocument()
        expect(screen.getByText('Cost saved')).toBeInTheDocument()
        expect(screen.getByText('Time saved by agents')).toBeInTheDocument()
    })

    it('should render correct data for AI Agent row', () => {
        renderComponent()

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getAllByText('18%').length).toBeGreaterThan(0)
        expect(screen.getByText('2,700')).toBeInTheDocument()
        expect(screen.getByText('189')).toBeInTheDocument()
        expect(screen.getByText('$1,200')).toBeInTheDocument()
        expect(screen.getByText('2h 45m')).toBeInTheDocument()
    })

    it('should render correct data for Article Recommendation row', () => {
        renderComponent()

        expect(
            screen.getAllByText('Article Recommendation').length,
        ).toBeGreaterThan(0)
        expect(screen.getAllByText('4%').length).toBeGreaterThan(0)
        expect(screen.getByText('450')).toBeInTheDocument()
        expect(screen.getByText('$450')).toBeInTheDocument()
        expect(screen.getByText('1h')).toBeInTheDocument()
    })

    it('should render correct data for Flows row', () => {
        renderComponent()

        expect(screen.getAllByText('Flows').length).toBeGreaterThan(0)
        expect(screen.getAllByText('7%').length).toBeGreaterThan(0)
        expect(screen.getByText('900')).toBeInTheDocument()
        expect(screen.getByText('63')).toBeInTheDocument()
        expect(screen.getByText('$500')).toBeInTheDocument()
        expect(screen.getByText('1h 15m')).toBeInTheDocument()
    })

    it('should render correct data for Order Management row', () => {
        renderComponent()

        expect(screen.getAllByText('Order Management').length).toBeGreaterThan(
            0,
        )
        expect(screen.getAllByText('3%').length).toBeGreaterThan(0)
        expect(screen.getByText('350')).toBeInTheDocument()
        expect(screen.getByText('$250')).toBeInTheDocument()
        expect(screen.getByText('30m')).toBeInTheDocument()
    })

    it('should format large numbers with commas', () => {
        renderComponent()

        expect(screen.getByText('2,700')).toBeInTheDocument()
    })

    it('should render TableToolbar component', () => {
        renderComponent()

        expect(screen.getByText('4 items')).toBeInTheDocument()
    })

    it('should have settings button in toolbar', () => {
        renderComponent()

        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render all info icons for column headers', () => {
        const { container } = renderComponent()

        const infoIcons = container.querySelectorAll('[aria-label="info"]')
        expect(infoIcons.length).toBeGreaterThan(0)
    })

    describe('Sort direction', () => {
        it('should hide sort arrows in column headers by default', () => {
            const { container } = renderComponent()

            const hiddenSortIcons = container.querySelectorAll(
                'span[style*="visibility: hidden"]',
            )
            expect(hiddenSortIcons.length).toBeGreaterThan(0)
        })

        it('should show sort arrow after clicking a metric column header', async () => {
            const user = userEvent.setup()
            const { container } = renderComponent()

            await user.click(screen.getByText('Overall automation rate'))

            const visibleSortIcon = container.querySelector(
                'span[style*="visibility: visible"]',
            )
            expect(visibleSortIcon).toBeInTheDocument()
        })

        it('should show arrow-up when metric column is sorted descending (first click)', async () => {
            const user = userEvent.setup()
            const { container } = renderComponent()

            await user.click(screen.getByText('Overall automation rate'))

            expect(
                container.querySelector('[aria-label="arrow-up"]'),
            ).toBeInTheDocument()
        })

        it('should show arrow-down when metric column is sorted ascending (second click)', async () => {
            const user = userEvent.setup()
            const { container } = renderComponent()

            await user.click(screen.getByText('Overall automation rate'))
            await user.click(screen.getByText('Overall automation rate'))

            expect(
                container.querySelector('[aria-label="arrow-down"]'),
            ).toBeInTheDocument()
        })

        it('should show sort arrow after clicking the Feature column header', async () => {
            const user = userEvent.setup()
            const { container } = renderComponent()

            await user.click(screen.getByText('Feature'))

            const visibleSortIcons = container.querySelectorAll(
                'span[style*="visibility: visible"]',
            )
            expect(visibleSortIcons.length).toBeGreaterThan(0)
        })
    })

    describe('Loading states', () => {
        it('should render skeleton for automationRate when loading', () => {
            renderComponent([{ ...defaultData[0], automationRate: null }], {
                ...defaultLoadingStates,
                automationRate: true,
            })

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getByText('2,700')).toBeInTheDocument()
            expect(screen.getByText('189')).toBeInTheDocument()
            expect(screen.queryByText('18%')).not.toBeInTheDocument()
        })

        it('should render skeleton for automatedInteractions when loading', () => {
            renderComponent(
                [
                    {
                        ...defaultData[0],
                        automatedInteractions: null,
                        costSaved: null,
                        timeSaved: null,
                    },
                ],
                { ...defaultLoadingStates, automatedInteractions: true },
            )

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getAllByText('18%').length).toBeGreaterThan(0)
            expect(screen.getByText('189')).toBeInTheDocument()
            expect(screen.queryByText('2,700')).not.toBeInTheDocument()
            expect(screen.queryByText('$1,200')).not.toBeInTheDocument()
        })

        it('should render skeleton for handovers when loading', () => {
            renderComponent([{ ...defaultData[0], handoverCount: null }], {
                ...defaultLoadingStates,
                handovers: true,
            })

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getAllByText('18%').length).toBeGreaterThan(0)
            expect(screen.getByText('2,700')).toBeInTheDocument()
            expect(screen.queryByText('189')).not.toBeInTheDocument()
        })

        it('should render skeleton for costSaved when automatedInteractions is loading', () => {
            renderComponent(
                [
                    {
                        ...defaultData[0],
                        automatedInteractions: null,
                        costSaved: null,
                        timeSaved: null,
                    },
                ],
                { ...defaultLoadingStates, automatedInteractions: true },
            )

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getAllByText('18%').length).toBeGreaterThan(0)
            expect(screen.getByText('189')).toBeInTheDocument()
            expect(screen.queryByText('$1,200')).not.toBeInTheDocument()
        })

        it('should render skeleton for timeSaved when timeSaved is loading', () => {
            renderComponent([{ ...defaultData[0], timeSaved: null }], {
                ...defaultLoadingStates,
                timeSaved: true,
            })

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getAllByText('18%').length).toBeGreaterThan(0)
            expect(screen.getByText('2,700')).toBeInTheDocument()
            expect(screen.queryByText('2h 45m')).not.toBeInTheDocument()
        })

        it('should render skeleton for timeSaved when automatedInteractions is loading', () => {
            renderComponent(
                [
                    {
                        ...defaultData[0],
                        automatedInteractions: null,
                        timeSaved: null,
                    },
                ],
                { ...defaultLoadingStates, automatedInteractions: true },
            )

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getAllByText('18%').length).toBeGreaterThan(0)
            expect(screen.getByText('189')).toBeInTheDocument()
            expect(screen.queryByText('2h 45m')).not.toBeInTheDocument()
        })

        it('should render multiple skeletons when multiple columns are loading', () => {
            renderComponent(
                [
                    {
                        feature: 'AI Agent',
                        automationRate: null,
                        automatedInteractions: null,
                        handoverCount: null,
                        costSaved: null,
                        timeSaved: null,
                    },
                    {
                        feature: 'Flows',
                        automationRate: null,
                        automatedInteractions: null,
                        handoverCount: null,
                        costSaved: null,
                        timeSaved: null,
                    },
                ],
                {
                    automationRate: true,
                    automatedInteractions: true,
                    handovers: true,
                    timeSaved: true,
                    costSaved: true,
                },
            )

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getByText('Flows')).toBeInTheDocument()
            expect(screen.queryByText('18%')).not.toBeInTheDocument()
            expect(screen.queryByText('7%')).not.toBeInTheDocument()
            expect(screen.queryByText('2,700')).not.toBeInTheDocument()
            expect(screen.queryByText('900')).not.toBeInTheDocument()
        })
    })
})
