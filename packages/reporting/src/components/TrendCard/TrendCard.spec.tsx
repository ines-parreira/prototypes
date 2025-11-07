import { render, screen } from '@testing-library/react'

import { MetricTrend, TwoDimensionalDataItem } from '../../types'
import { TrendCard, TrendCardProps } from './TrendCard'

const mockTimeSeriesData: TwoDimensionalDataItem[] = [
    {
        label: 'Series 1',
        values: [
            { x: '2024-01-01', y: 10 },
            { x: '2024-01-02', y: 20 },
            { x: '2024-01-03', y: 15 },
        ],
    },
]

const mockTrend: MetricTrend = {
    isFetching: false,
    isError: false,
    data: {
        label: 'Test Metric',
        value: 100,
        prevValue: 80,
    },
}

const defaultProps: TrendCardProps = {
    trend: mockTrend,
    timeSeriesData: mockTimeSeriesData,
    interpretAs: 'more-is-better',
}

describe('TrendCard', () => {
    it('should render with all required data and components', () => {
        render(<TrendCard {...defaultProps} />)

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should render loading state', () => {
        render(<TrendCard {...defaultProps} isLoading />)

        const loadingElements = screen.getAllByLabelText('Loading')
        expect(loadingElements.length).toBeGreaterThan(0)
    })

    it('should render hint tooltip', () => {
        const hint = {
            title: 'Test hint title',
            link: 'https://example.com',
            linkText: 'Learn more',
        }

        render(<TrendCard {...defaultProps} hint={hint} />)

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
        const infoIcon = document.querySelector('svg')
        expect(infoIcon).toBeInTheDocument()
    })

    it('should render with different interpretAs values', () => {
        const { rerender } = render(<TrendCard {...defaultProps} />)

        expect(screen.getByText('Test Metric')).toBeInTheDocument()

        rerender(<TrendCard {...defaultProps} interpretAs="less-is-better" />)
        expect(screen.getByText('Test Metric')).toBeInTheDocument()

        rerender(<TrendCard {...defaultProps} interpretAs="neutral" />)
        expect(screen.getByText('Test Metric')).toBeInTheDocument()
    })

    it('should render with different metricFormat values', () => {
        const { rerender } = render(
            <TrendCard {...defaultProps} metricFormat="decimal" />,
        )

        expect(screen.getByText('Test Metric')).toBeInTheDocument()

        rerender(<TrendCard {...defaultProps} metricFormat="percent" />)
        expect(screen.getByText('Test Metric')).toBeInTheDocument()

        rerender(<TrendCard {...defaultProps} metricFormat="currency" />)
        expect(screen.getByText('Test Metric')).toBeInTheDocument()
    })

    it('should render when trend data is undefined', () => {
        const trendWithoutData: MetricTrend = {
            isFetching: false,
            isError: false,
            data: undefined,
        }

        const { container } = render(
            <TrendCard
                {...defaultProps}
                trend={trendWithoutData}
                timeSeriesData={mockTimeSeriesData}
            />,
        )

        const card = container.querySelector('[class*="card"]')
        expect(card).toBeInTheDocument()
    })

    it('should render with null metric values', () => {
        const trendWithNullValues: MetricTrend = {
            isFetching: false,
            isError: false,
            data: {
                label: 'Test Metric',
                value: null,
                prevValue: null,
            },
        }

        render(
            <TrendCard
                {...defaultProps}
                trend={trendWithNullValues}
                timeSeriesData={mockTimeSeriesData}
            />,
        )

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
    })

    it('should render with empty timeSeriesData', () => {
        render(<TrendCard {...defaultProps} timeSeriesData={[]} />)

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should render with multiple series in timeSeriesData', () => {
        const multipleSeriesData: TwoDimensionalDataItem[] = [
            {
                label: 'Series 1',
                values: [
                    { x: '2024-01-01', y: 10 },
                    { x: '2024-01-02', y: 20 },
                ],
            },
            {
                label: 'Series 2',
                values: [
                    { x: '2024-01-01', y: 15 },
                    { x: '2024-01-02', y: 25 },
                ],
            },
        ]

        render(
            <TrendCard {...defaultProps} timeSeriesData={multipleSeriesData} />,
        )

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should render metric value and label together', () => {
        render(<TrendCard {...defaultProps} />)

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should maintain component structure with loading and hint', () => {
        const hint = {
            title: 'Test hint',
        }

        render(<TrendCard {...defaultProps} isLoading hint={hint} />)

        const loadingElements = screen.getAllByLabelText('Loading')
        expect(loadingElements.length).toBeGreaterThan(0)
    })
})
