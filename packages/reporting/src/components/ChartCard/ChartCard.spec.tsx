import { render, screen } from '@testing-library/react'

import { DonutChart } from '../DonutChart/DonutChart'
import { ChartCard } from './ChartCard'
import type { ChartDataItem } from './types'

describe('ChartCard', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }

        Element.prototype.getAnimations = function () {
            return []
        }
    })

    const mockData: ChartDataItem[] = [
        { name: 'AI Agent', value: 18 },
        { name: 'Flows', value: 7 },
        { name: 'Article Recommendation', value: 4 },
        { name: 'Order Management', value: 3 },
    ]

    describe('rendering', () => {
        it('should render with title and children', () => {
            render(
                <ChartCard title="My Chart">
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('My Chart')).toBeInTheDocument()
            expect(screen.getByText('AI Agent')).toBeInTheDocument()
        })

        it('should render with value and trend', () => {
            render(
                <ChartCard title="Automation Rate" value="32%" trend={2}>
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('Automation Rate')).toBeInTheDocument()
            expect(screen.getByText('32%')).toBeInTheDocument()
        })

        it('should render children (chart component)', () => {
            render(
                <ChartCard title="My Chart">
                    <div data-testid="custom-chart">Custom Chart Content</div>
                </ChartCard>,
            )

            expect(screen.getByTestId('custom-chart')).toBeInTheDocument()
            expect(screen.getByText('Custom Chart Content')).toBeInTheDocument()
        })
    })

    describe('chartControls', () => {
        it('should render chart controls when provided', () => {
            const controls = <button>Toggle Chart</button>

            render(
                <ChartCard title="My Chart" chartControls={controls}>
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('Toggle Chart')).toBeInTheDocument()
        })

        it('should not render chart controls when not provided', () => {
            render(
                <ChartCard title="My Chart">
                    <div data-testid="custom-chart">Custom Chart</div>
                </ChartCard>,
            )

            expect(screen.queryByRole('button')).not.toBeInTheDocument()
        })
    })

    describe('metrics dropdown', () => {
        const mockMetrics = [
            { id: '1', label: 'Metric 1' },
            { id: '2', label: 'Metric 2' },
            { id: '3', label: 'Metric 3' },
        ]

        it('should not show metric selector when metrics list is empty', () => {
            render(
                <ChartCard title="My Chart" metrics={[]}>
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(
                screen.queryByRole('button', { name: /arrow-chevron/ }),
            ).not.toBeInTheDocument()
        })

        it('should not show metric selector when only one metric is provided', () => {
            render(
                <ChartCard
                    title="Single Metric"
                    metrics={[{ id: '1', label: 'Single Metric' }]}
                >
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(
                screen.queryByRole('button', { name: /arrow-chevron/ }),
            ).not.toBeInTheDocument()
        })

        it('should show metric selector when multiple metrics are provided', () => {
            const mockOnMetricChange = vi.fn()
            render(
                <ChartCard
                    title="Metric 1"
                    metrics={mockMetrics}
                    onMetricChange={mockOnMetricChange}
                >
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            const selectButton = screen.getByRole('button', {
                name: /metric 1/i,
            })
            expect(selectButton).toBeInTheDocument()
        })

        it('should not show metric selector when metrics prop is not provided', () => {
            render(
                <ChartCard title="My Chart">
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(
                screen.queryByRole('button', { name: /arrow-chevron/ }),
            ).not.toBeInTheDocument()
        })
    })

    describe('card container', () => {
        it('should render Card component', () => {
            const { container } = render(
                <ChartCard title="My Chart">
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            const card = container.querySelector('[data-name="card"]')
            expect(card).toBeInTheDocument()
        })
    })

    describe('trend props', () => {
        it('should pass interpretAs prop to header', () => {
            render(
                <ChartCard
                    title="My Chart"
                    interpretAs="more-is-better"
                    trend={5}
                >
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('My Chart')).toBeInTheDocument()
        })

        it('should pass metricFormat prop to header', () => {
            render(
                <ChartCard title="My Chart" metricFormat="decimal" trend={5}>
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('My Chart')).toBeInTheDocument()
        })

        it('should pass currency prop to header', () => {
            render(
                <ChartCard title="My Chart" currency="USD" trend={5}>
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('My Chart')).toBeInTheDocument()
        })
    })
})
