import { render } from '@testing-library/react'

import { TwoDimensionalDataItem } from '../../types'
import { LineChart } from './LineChart'

describe('LineChart', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
    })
    const mockData: TwoDimensionalDataItem[] = [
        {
            label: 'Series 1',
            values: [
                { x: '2024-01', y: 100 },
                { x: '2024-02', y: 150 },
            ],
        },
        {
            label: 'Series 2',
            values: [
                { x: '2024-01', y: 200 },
                { x: '2024-02', y: 250 },
            ],
        },
    ]

    describe('loading state', () => {
        it('should show skeleton when loading', () => {
            const { container } = render(
                <LineChart data={mockData} isLoading />,
            )

            expect(
                container.querySelector('.recharts-wrapper'),
            ).not.toBeInTheDocument()
        })

        it('should show chart when not loading', () => {
            const { container } = render(
                <LineChart data={mockData} isLoading={false} />,
            )

            expect(
                container.querySelector('.recharts-wrapper'),
            ).toBeInTheDocument()
        })

        it('should show chart by default when isLoading is not provided', () => {
            const { container } = render(<LineChart data={mockData} />)

            expect(
                container.querySelector('.recharts-wrapper'),
            ).toBeInTheDocument()
        })
    })

    describe('data rendering', () => {
        it('should render multiple series as line paths', () => {
            const { container } = render(<LineChart data={mockData} />)

            const lines = container.querySelectorAll('.recharts-line')
            expect(lines.length).toBe(2)
        })

        it('should render single series', () => {
            const singleSeriesData: TwoDimensionalDataItem[] = [
                {
                    label: 'Single Series',
                    values: [
                        { x: '2024-01', y: 100 },
                        { x: '2024-02', y: 150 },
                    ],
                },
            ]

            const { container } = render(<LineChart data={singleSeriesData} />)

            const lines = container.querySelectorAll('.recharts-line')
            expect(lines.length).toBe(1)
        })

        it('should handle empty data array without errors', () => {
            const { container } = render(<LineChart data={[]} />)

            expect(
                container.querySelector('.recharts-wrapper'),
            ).toBeInTheDocument()
            const lines = container.querySelectorAll('.recharts-line')
            expect(lines.length).toBe(0)
        })
    })
})
