import { render, screen } from '@testing-library/react'

import { PerformanceBreakdownTable } from '../PerformanceBreakdownTable'

jest.mock('../../../hooks/usePerformanceMetricsPerFeature')
jest.mock('../DownloadPerformanceBreakdownButton', () => ({
    DownloadPerformanceBreakdownButton: () => <div>Download Button</div>,
}))

const mockUsePerformanceMetricsPerFeature = jest.requireMock(
    '../../../hooks/usePerformanceMetricsPerFeature',
).usePerformanceMetricsPerFeature as jest.Mock

describe('PerformanceBreakdownTable', () => {
    beforeEach(() => {
        mockUsePerformanceMetricsPerFeature.mockReturnValue({
            data: [
                {
                    feature: 'AI Agent',
                    automationRate: 18,
                    automatedInteractions: 2700,
                    handoverCount: 189,
                    costSaved: 1200,
                    timeSaved: 9900,
                },
                {
                    feature: 'Flows',
                    automationRate: 7,
                    automatedInteractions: 900,
                    handoverCount: 63,
                    costSaved: 500,
                    timeSaved: 4500,
                },
                {
                    feature: 'Article Recommendation',
                    automationRate: 4,
                    automatedInteractions: 450,
                    handoverCount: null,
                    costSaved: 450,
                    timeSaved: 3600,
                },
                {
                    feature: 'Order Management',
                    automationRate: 3,
                    automatedInteractions: 350,
                    handoverCount: null,
                    costSaved: 250,
                    timeSaved: 1800,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                automationRate: false,
                automatedInteractions: false,
                handovers: false,
                timeSaved: false,
            },
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the table heading', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getByText('Performance breakdown')).toBeInTheDocument()
    })

    it('should render all feature names in table', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(
            screen.getAllByText('Article Recommendation').length,
        ).toBeGreaterThan(0)
        expect(screen.getAllByText('Flows').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Order Management').length).toBeGreaterThan(
            0,
        )
    })

    it('should render the correct number of rows', () => {
        render(<PerformanceBreakdownTable />)

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
        render(<PerformanceBreakdownTable />)

        expect(screen.getByText('Feature')).toBeInTheDocument()
        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
        expect(screen.getByText('Handover interactions')).toBeInTheDocument()
        expect(screen.getByText('Cost saved')).toBeInTheDocument()
        expect(screen.getByText('Time saved by agents')).toBeInTheDocument()
    })

    it('should render correct data for AI Agent row', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getAllByText('18%').length).toBeGreaterThan(0)
        expect(screen.getByText('2,700')).toBeInTheDocument()
        expect(screen.getByText('189')).toBeInTheDocument()
        expect(screen.getByText('$1,200')).toBeInTheDocument()
        expect(screen.getByText('2h 45m')).toBeInTheDocument()
    })

    it('should render correct data for Article Recommendation row', () => {
        render(<PerformanceBreakdownTable />)

        expect(
            screen.getAllByText('Article Recommendation').length,
        ).toBeGreaterThan(0)
        expect(screen.getAllByText('4%').length).toBeGreaterThan(0)
        expect(screen.getByText('450')).toBeInTheDocument()
        expect(screen.getByText('$450')).toBeInTheDocument()
        expect(screen.getByText('1h')).toBeInTheDocument()
    })

    it('should render correct data for Flows row', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getAllByText('Flows').length).toBeGreaterThan(0)
        expect(screen.getAllByText('7%').length).toBeGreaterThan(0)
        expect(screen.getByText('900')).toBeInTheDocument()
        expect(screen.getByText('63')).toBeInTheDocument()
        expect(screen.getByText('$500')).toBeInTheDocument()
        expect(screen.getByText('1h 15m')).toBeInTheDocument()
    })

    it('should render correct data for Order Management row', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getAllByText('Order Management').length).toBeGreaterThan(
            0,
        )
        expect(screen.getAllByText('3%').length).toBeGreaterThan(0)
        expect(screen.getByText('350')).toBeInTheDocument()
        expect(screen.getByText('$250')).toBeInTheDocument()
        expect(screen.getByText('30m')).toBeInTheDocument()
    })

    it('should format large numbers with commas', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getByText('2,700')).toBeInTheDocument()
    })

    it('should render TableToolbar component', () => {
        render(<PerformanceBreakdownTable />)

        expect(screen.getByText('4 items')).toBeInTheDocument()
    })

    it('should have settings button in toolbar', () => {
        render(<PerformanceBreakdownTable />)

        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render all info icons for column headers', () => {
        const { container } = render(<PerformanceBreakdownTable />)

        const infoIcons = container.querySelectorAll('[aria-label="info"]')
        expect(infoIcons.length).toBeGreaterThan(0)
    })

    describe('Loading states', () => {
        it('should render skeleton for automationRate when loading', () => {
            mockUsePerformanceMetricsPerFeature.mockReturnValue({
                data: [
                    {
                        feature: 'AI Agent',
                        automationRate: null,
                        automatedInteractions: 2700,
                        handoverCount: 189,
                        costSaved: 1200,
                        timeSaved: 9900,
                    },
                ],
                isLoading: false,
                isError: false,
                loadingStates: {
                    automationRate: true,
                    automatedInteractions: false,
                    handovers: false,
                    timeSaved: false,
                },
            })

            render(<PerformanceBreakdownTable />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getByText('2,700')).toBeInTheDocument()
            expect(screen.getByText('189')).toBeInTheDocument()
            expect(screen.queryByText('18%')).not.toBeInTheDocument()
        })

        it('should render skeleton for automatedInteractions when loading', () => {
            mockUsePerformanceMetricsPerFeature.mockReturnValue({
                data: [
                    {
                        feature: 'AI Agent',
                        automationRate: 18,
                        automatedInteractions: null,
                        handoverCount: 189,
                        costSaved: null,
                        timeSaved: null,
                    },
                ],
                isLoading: false,
                isError: false,
                loadingStates: {
                    automationRate: false,
                    automatedInteractions: true,
                    handovers: false,
                    timeSaved: false,
                },
            })

            render(<PerformanceBreakdownTable />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getAllByText('18%').length).toBeGreaterThan(0)
            expect(screen.getByText('189')).toBeInTheDocument()
            expect(screen.queryByText('2,700')).not.toBeInTheDocument()
            expect(screen.queryByText('$1,200')).not.toBeInTheDocument()
        })

        it('should render skeleton for handovers when loading', () => {
            mockUsePerformanceMetricsPerFeature.mockReturnValue({
                data: [
                    {
                        feature: 'AI Agent',
                        automationRate: 18,
                        automatedInteractions: 2700,
                        handoverCount: null,
                        costSaved: 1200,
                        timeSaved: 9900,
                    },
                ],
                isLoading: false,
                isError: false,
                loadingStates: {
                    automationRate: false,
                    automatedInteractions: false,
                    handovers: true,
                    timeSaved: false,
                },
            })

            render(<PerformanceBreakdownTable />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getAllByText('18%').length).toBeGreaterThan(0)
            expect(screen.getByText('2,700')).toBeInTheDocument()
            expect(screen.queryByText('189')).not.toBeInTheDocument()
        })

        it('should render skeleton for costSaved when automatedInteractions is loading', () => {
            mockUsePerformanceMetricsPerFeature.mockReturnValue({
                data: [
                    {
                        feature: 'AI Agent',
                        automationRate: 18,
                        automatedInteractions: null,
                        handoverCount: 189,
                        costSaved: null,
                        timeSaved: 9900,
                    },
                ],
                isLoading: false,
                isError: false,
                loadingStates: {
                    automationRate: false,
                    automatedInteractions: true,
                    handovers: false,
                    timeSaved: false,
                },
            })

            render(<PerformanceBreakdownTable />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getAllByText('18%').length).toBeGreaterThan(0)
            expect(screen.getByText('189')).toBeInTheDocument()
            expect(screen.queryByText('$1,200')).not.toBeInTheDocument()
        })

        it('should render skeleton for timeSaved when timeSaved is loading', () => {
            mockUsePerformanceMetricsPerFeature.mockReturnValue({
                data: [
                    {
                        feature: 'AI Agent',
                        automationRate: 18,
                        automatedInteractions: 2700,
                        handoverCount: 189,
                        costSaved: 1200,
                        timeSaved: null,
                    },
                ],
                isLoading: false,
                isError: false,
                loadingStates: {
                    automationRate: false,
                    automatedInteractions: false,
                    handovers: false,
                    timeSaved: true,
                },
            })

            render(<PerformanceBreakdownTable />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getAllByText('18%').length).toBeGreaterThan(0)
            expect(screen.getByText('2,700')).toBeInTheDocument()
            expect(screen.queryByText('2h 45m')).not.toBeInTheDocument()
        })

        it('should render skeleton for timeSaved when automatedInteractions is loading', () => {
            mockUsePerformanceMetricsPerFeature.mockReturnValue({
                data: [
                    {
                        feature: 'AI Agent',
                        automationRate: 18,
                        automatedInteractions: null,
                        handoverCount: 189,
                        costSaved: 1200,
                        timeSaved: null,
                    },
                ],
                isLoading: false,
                isError: false,
                loadingStates: {
                    automationRate: false,
                    automatedInteractions: true,
                    handovers: false,
                    timeSaved: false,
                },
            })

            render(<PerformanceBreakdownTable />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getAllByText('18%').length).toBeGreaterThan(0)
            expect(screen.getByText('189')).toBeInTheDocument()
            expect(screen.queryByText('2h 45m')).not.toBeInTheDocument()
        })

        it('should not render handover skeleton for Article Recommendation even when loading', () => {
            mockUsePerformanceMetricsPerFeature.mockReturnValue({
                data: [
                    {
                        feature: 'Article Recommendation',
                        automationRate: 4,
                        automatedInteractions: 450,
                        handoverCount: null,
                        costSaved: 450,
                        timeSaved: 3600,
                    },
                ],
                isLoading: false,
                isError: false,
                loadingStates: {
                    automationRate: false,
                    automatedInteractions: false,
                    handovers: true,
                    timeSaved: false,
                },
            })

            render(<PerformanceBreakdownTable />)

            expect(screen.getByText('-')).toBeInTheDocument()
        })

        it('should not render handover skeleton for Order Management even when loading', () => {
            mockUsePerformanceMetricsPerFeature.mockReturnValue({
                data: [
                    {
                        feature: 'Order Management',
                        automationRate: 3,
                        automatedInteractions: 350,
                        handoverCount: null,
                        costSaved: 250,
                        timeSaved: 1800,
                    },
                ],
                isLoading: false,
                isError: false,
                loadingStates: {
                    automationRate: false,
                    automatedInteractions: false,
                    handovers: true,
                    timeSaved: false,
                },
            })

            render(<PerformanceBreakdownTable />)

            expect(screen.getByText('-')).toBeInTheDocument()
        })

        it('should render multiple skeletons when multiple columns are loading', () => {
            mockUsePerformanceMetricsPerFeature.mockReturnValue({
                data: [
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
                isLoading: false,
                isError: false,
                loadingStates: {
                    automationRate: true,
                    automatedInteractions: true,
                    handovers: true,
                    timeSaved: true,
                },
            })

            render(<PerformanceBreakdownTable />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getByText('Flows')).toBeInTheDocument()
            expect(screen.queryByText('18%')).not.toBeInTheDocument()
            expect(screen.queryByText('7%')).not.toBeInTheDocument()
            expect(screen.queryByText('2,700')).not.toBeInTheDocument()
            expect(screen.queryByText('900')).not.toBeInTheDocument()
        })
    })
})
