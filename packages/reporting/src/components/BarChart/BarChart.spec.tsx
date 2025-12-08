import { render } from '@testing-library/react'

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

    describe('renderBarTooltipContent', () => {
        it('should return null when payload is empty', () => {
            const result = renderBarTooltipContent({ payload: [] })

            expect(result).toBeNull()
        })

        it('should return null when payload is undefined', () => {
            const result = renderBarTooltipContent({ payload: undefined })

            expect(result).toBeNull()
        })

        it('should render BarChartTooltip when payload has data', () => {
            const payload = [
                {
                    payload: {
                        name: 'Support',
                        value: 1800,
                        color: '#A084E1',
                    },
                },
            ]

            const result = renderBarTooltipContent({ payload })

            expect(result).toBeTruthy()
            expect(result?.props.name).toBe('Support')
            expect(result?.props.value).toBe(1800)
            expect(result?.props.color).toBe('#A084E1')
        })
    })
})
