import { render, screen } from '@testing-library/react'

import { NOT_AVAILABLE_PLACEHOLDER } from '../../constants'
import type { TwoDimensionalDataItem } from '../../types'
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
            render(<LineChart title="My chart" data={mockData} isLoading />)

            expect(screen.queryByText('My chart')).not.toBeInTheDocument()
        })

        it('should show chart when not loading', () => {
            render(
                <LineChart
                    title="My chart"
                    data={mockData}
                    isLoading={false}
                />,
            )

            expect(screen.getByText('My chart')).toBeInTheDocument()
        })

        it('should show chart by default when isLoading is not provided', () => {
            render(<LineChart title="My chart" data={mockData} />)

            expect(screen.getByText('My chart')).toBeInTheDocument()
        })
    })

    describe('data rendering', () => {
        it('should render chart with data without errors', () => {
            render(<LineChart title="My chart" data={mockData} />)

            expect(screen.getByText('My chart')).toBeInTheDocument()
        })

        it('should handle empty data array without errors', () => {
            render(<LineChart title="My chart" data={[]} />)

            expect(screen.getByText('My chart')).toBeInTheDocument()
        })

        it('should render area variant with data without errors', () => {
            render(
                <LineChart title="My chart" data={mockData} variant="area" />,
            )

            expect(screen.getByText('My chart')).toBeInTheDocument()
        })
    })

    describe('metric selection', () => {
        const mockMetrics = [
            { id: '1', label: 'Metric 1' },
            { id: '2', label: 'Metric 2' },
            { id: '3', label: 'Metric 3' },
        ]

        it('should not show metric selector when metrics list is empty', () => {
            render(<LineChart title="My chart" data={mockData} metrics={[]} />)

            expect(
                screen.queryByRole('button', { name: /arrow-chevron/ }),
            ).not.toBeInTheDocument()
        })

        it('should not show metric selector when only one metric is provided', () => {
            render(
                <LineChart
                    title="My chart"
                    data={mockData}
                    metrics={[{ id: '1', label: 'Single Metric' }]}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /arrow-chevron/ }),
            ).not.toBeInTheDocument()
        })

        it('should show metric selector when multiple metrics are provided', () => {
            render(
                <LineChart
                    title="Metric 1"
                    data={mockData}
                    metrics={mockMetrics}
                />,
            )

            expect(
                screen.getByRole('button', { name: /arrow-chevron/ }),
            ).toBeInTheDocument()
        })

        it('should not show metric selector when metrics prop is not provided', () => {
            render(<LineChart title="My chart" data={mockData} />)

            expect(
                screen.queryByRole('button', { name: /arrow-chevron/ }),
            ).not.toBeInTheDocument()
        })
    })

    describe('subtitle', () => {
        it('should not render subtitle when value is not provided', () => {
            render(<LineChart title="My chart" data={mockData} />)

            expect(screen.queryByRole('heading')).not.toBeInTheDocument()
        })

        it('should render formatted value when value is provided', () => {
            render(
                <LineChart
                    title="My chart"
                    data={mockData}
                    value={1234}
                    prevValue={1000}
                />,
            )

            expect(screen.getByRole('heading')).toHaveTextContent('1,234')
        })

        it('should render placeholder when value is 0', () => {
            render(<LineChart title="My chart" data={mockData} value={0} />)

            expect(screen.getByRole('heading')).toHaveTextContent(
                NOT_AVAILABLE_PLACEHOLDER,
            )
        })

        it('should render placeholder when value is null', () => {
            render(<LineChart title="My chart" data={mockData} value={null} />)

            expect(screen.getByRole('heading')).toHaveTextContent(
                NOT_AVAILABLE_PLACEHOLDER,
            )
        })
    })
})
