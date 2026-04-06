import { render, screen } from '@testing-library/react'

import type { ChartDataItem } from '../ChartCard/types'
import { BarChart, renderBarTooltipContent } from './BarChart'

describe('BarChart', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
    })

    const mockData: ChartDataItem[] = [
        { name: 'Support', value: 1800 },
        { name: 'Shopping assistant', value: 1200 },
    ]

    describe('loading state', () => {
        it('should show skeleton when loading', () => {
            const { container } = render(<BarChart data={mockData} isLoading />)

            const skeletons = container.querySelectorAll(
                '[data-name="skeleton"]',
            )
            expect(skeletons.length).toBeGreaterThan(0)
        })

        it('should show chart when not loading', () => {
            const { container } = render(
                <BarChart data={mockData} isLoading={false} />,
            )

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })

        it('should show chart by default when isLoading is not provided', () => {
            const { container } = render(<BarChart data={mockData} />)

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })
    })

    describe('data rendering', () => {
        it('should render chart with data without errors', () => {
            const { container } = render(<BarChart data={mockData} />)

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })

        it('should handle empty data array without errors', () => {
            const { container } = render(<BarChart data={[]} />)

            expect(container).toBeInTheDocument()
        })
    })

    describe('chart components', () => {
        it('should render ResponsiveContainer', () => {
            const { container } = render(<BarChart data={mockData} />)

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })
    })

    describe('container dimensions', () => {
        it('should accept custom container width', () => {
            const { container } = render(
                <BarChart data={mockData} containerWidth={500} />,
            )

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })

        it('should accept custom container height', () => {
            const { container } = render(
                <BarChart data={mockData} containerHeight={400} />,
            )

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })
    })

    describe('chartHeight', () => {
        it('should render with default chart height', () => {
            const { container } = render(<BarChart data={mockData} />)

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })

        it('should render with custom chart height', () => {
            const { container } = render(
                <BarChart data={mockData} chartHeight={200} />,
            )

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })

        it('should use custom chart height for skeleton when loading', () => {
            const { container } = render(
                <BarChart data={mockData} isLoading chartHeight={200} />,
            )

            const skeletons = container.querySelectorAll(
                '[data-name="skeleton"]',
            )
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })

    describe('maxBarSize', () => {
        it('should render chart without maxBarSize by default', () => {
            const { container } = render(<BarChart data={mockData} />)

            expect(container.firstChild).toBeTruthy()
        })

        it('should pass maxBarSize to the chart', () => {
            const { container } = render(
                <BarChart data={mockData} maxBarSize={40} />,
            )

            expect(container.firstChild).toBeTruthy()
        })

        it('should render skeletons when loading with maxBarSize', () => {
            const { container } = render(
                <BarChart data={mockData} isLoading maxBarSize={40} />,
            )

            const skeletons = container.querySelectorAll(
                '[data-name="skeleton"]',
            )
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })

    describe('legend', () => {
        it('should not render legend by default', () => {
            render(<BarChart data={mockData} />)

            expect(screen.queryByText('Support')).not.toBeInTheDocument()
            expect(
                screen.queryByText('Shopping assistant'),
            ).not.toBeInTheDocument()
        })

        it('should render legend when withLegend is true', () => {
            render(<BarChart data={mockData} withLegend />)

            expect(screen.getByText('Support')).toBeInTheDocument()
            expect(screen.getByText('Shopping assistant')).toBeInTheDocument()
        })

        it('should not render legend when withLegend is false', () => {
            render(<BarChart data={mockData} withLegend={false} />)

            expect(screen.queryByText('Support')).not.toBeInTheDocument()
            expect(
                screen.queryByText('Shopping assistant'),
            ).not.toBeInTheDocument()
        })
    })

    describe('renderBarTooltipContent', () => {
        it('should return null when payload is empty', () => {
            const tooltipRenderer = renderBarTooltipContent()
            const result = tooltipRenderer({ payload: [] })

            expect(result).toBeNull()
        })

        it('should return null when payload is undefined', () => {
            const tooltipRenderer = renderBarTooltipContent()
            const result = tooltipRenderer({ payload: undefined })

            expect(result).toBeNull()
        })

        it('should render BarChartTooltip when payload has data', () => {
            const tooltipRenderer = renderBarTooltipContent()
            const payload = [
                {
                    payload: {
                        name: 'Support',
                        value: 1800,
                        color: '#A084E1',
                    },
                },
            ]

            const result = tooltipRenderer({ payload })

            expect(result).toBeTruthy()
            expect(result?.props.name).toBe('Support')
            expect(result?.props.value).toBe(1800)
            expect(result?.props.color).toBe('#A084E1')
        })

        it('should use valueFormatter when provided', () => {
            const valueFormatter = (value: number) => `$${value}`
            const tooltipRenderer = renderBarTooltipContent(valueFormatter)
            const payload = [
                {
                    payload: {
                        name: 'Support',
                        value: 1800,
                        color: '#A084E1',
                    },
                },
            ]

            const result = tooltipRenderer({ payload })

            expect(result).toBeTruthy()
            expect(result?.props.valueFormatter).toBe(valueFormatter)
        })

        it('should include period when provided', () => {
            const period = {
                start_datetime: '2024-01-01',
                end_datetime: '2024-01-31',
            }
            const tooltipRenderer = renderBarTooltipContent(undefined, period)
            const payload = [
                {
                    payload: {
                        name: 'Support',
                        value: 1800,
                        color: '#A084E1',
                    },
                },
            ]

            const result = tooltipRenderer({ payload })

            expect(result).toBeTruthy()
            expect(result?.props.period).toEqual(period)
        })
    })
})
