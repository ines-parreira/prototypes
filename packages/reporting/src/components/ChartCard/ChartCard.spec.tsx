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

        it('should render with value and prevValue', () => {
            render(
                <ChartCard
                    title="Automation Rate"
                    value={0.32}
                    prevValue={0.3}
                    metricFormat="decimal-to-percent"
                >
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('Automation Rate')).toBeInTheDocument()
            expect(screen.getByText('32%')).toBeInTheDocument()
        })

        it('should render with string value', () => {
            render(
                <ChartCard title="Total Count" value={1234}>
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('Total Count')).toBeInTheDocument()
            expect(screen.getByText('1,234')).toBeInTheDocument()
        })

        it('should render with numeric value', () => {
            render(
                <ChartCard title="Score" value={95}>
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('Score')).toBeInTheDocument()
            expect(screen.getByText('95')).toBeInTheDocument()
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

    describe('props passed to header', () => {
        it('should pass interpretAs prop to header', () => {
            render(
                <ChartCard
                    title="My Chart"
                    value={100}
                    prevValue={90}
                    interpretAs="more-is-better"
                >
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('My Chart')).toBeInTheDocument()
        })

        it('should pass metricFormat prop to header', () => {
            render(
                <ChartCard
                    title="My Chart"
                    value={95}
                    prevValue={90}
                    metricFormat="decimal"
                >
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('My Chart')).toBeInTheDocument()
        })

        it('should pass currency prop to header', () => {
            render(
                <ChartCard
                    title="My Chart"
                    value={100}
                    prevValue={90}
                    currency="USD"
                    metricFormat="currency"
                >
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('My Chart')).toBeInTheDocument()
        })

        it('should pass tooltipData prop to header', () => {
            render(
                <ChartCard
                    title="My Chart"
                    value={100}
                    prevValue={90}
                    tooltipData={{ period: 'Jan 1 - Jan 31' }}
                >
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('My Chart')).toBeInTheDocument()
        })
    })

    describe('prop combinations', () => {
        it('should handle all props together', () => {
            const mockOnMetricChange = vi.fn()
            const mockMetrics = [
                { id: '1', label: 'Metric 1' },
                { id: '2', label: 'Metric 2' },
            ]
            const controls = <button>Toggle View</button>

            render(
                <ChartCard
                    title="Complete Chart"
                    value={150}
                    prevValue={120}
                    metricFormat="decimal"
                    currency="USD"
                    interpretAs="more-is-better"
                    metrics={mockMetrics}
                    onMetricChange={mockOnMetricChange}
                    chartControls={controls}
                    tooltipData={{ period: 'Last 7 days' }}
                >
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('Complete Chart')).toBeInTheDocument()
            expect(screen.getByText('150')).toBeInTheDocument()
            expect(screen.getByText('Toggle View')).toBeInTheDocument()
        })

        it('should render with minimal props', () => {
            render(
                <ChartCard title="Minimal Chart">
                    <div>Chart Content</div>
                </ChartCard>,
            )

            expect(screen.getByText('Minimal Chart')).toBeInTheDocument()
            expect(screen.getByText('Chart Content')).toBeInTheDocument()
        })

        it('should render without value but with prevValue', () => {
            render(
                <ChartCard title="My Chart" prevValue={90}>
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('My Chart')).toBeInTheDocument()
        })

        it('should render with interpretAs as neutral (default)', () => {
            render(
                <ChartCard title="My Chart" value={100} prevValue={100}>
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('My Chart')).toBeInTheDocument()
        })

        it('should render with interpretAs as less-is-better', () => {
            render(
                <ChartCard
                    title="Response Time"
                    value={50}
                    prevValue={60}
                    interpretAs="less-is-better"
                >
                    <DonutChart data={mockData} />
                </ChartCard>,
            )

            expect(screen.getByText('Response Time')).toBeInTheDocument()
        })
    })
})
