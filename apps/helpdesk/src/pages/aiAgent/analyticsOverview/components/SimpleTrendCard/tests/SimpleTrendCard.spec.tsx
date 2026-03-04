import { render, screen } from '@testing-library/react'

import { SimpleTrendCard } from '../SimpleTrendCard'

describe('SimpleTrendCard', () => {
    const mockTrendData = [
        { x: '1', y: 10 },
        { x: '2', y: 20 },
        { x: '3', y: 15 },
        { x: '4', y: 25 },
    ]

    it('should render the title', () => {
        render(
            <SimpleTrendCard
                title="Test Metric"
                value="100"
                trend={5}
                trendData={mockTrendData}
            />,
        )

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
    })

    it('should render the value', () => {
        render(
            <SimpleTrendCard
                title="Test Metric"
                value="$1,200"
                trend={5}
                trendData={mockTrendData}
            />,
        )

        expect(screen.getByText('$1,200')).toBeInTheDocument()
    })

    it('should render positive trend with trending-up icon', () => {
        const { container } = render(
            <SimpleTrendCard
                title="Test Metric"
                value="100"
                trend={5}
                trendData={mockTrendData}
            />,
        )

        expect(screen.getByText('5%')).toBeInTheDocument()
        const trendingUpIcon = container.querySelector(
            '[aria-label="trending-up"]',
        )
        expect(trendingUpIcon).toBeInTheDocument()
    })

    it('should render negative trend with trending-down icon', () => {
        const { container } = render(
            <SimpleTrendCard
                title="Test Metric"
                value="100"
                trend={-5}
                trendData={mockTrendData}
            />,
        )

        expect(screen.getByText('5%')).toBeInTheDocument()
        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should render trend percentage as absolute value', () => {
        render(
            <SimpleTrendCard
                title="Test Metric"
                value="100"
                trend={-15}
                trendData={mockTrendData}
            />,
        )

        expect(screen.getByText('15%')).toBeInTheDocument()
    })

    it('should apply positive class for positive trend', () => {
        const { container } = render(
            <SimpleTrendCard
                title="Test Metric"
                value="100"
                trend={5}
                trendData={mockTrendData}
            />,
        )

        const trendElement = container.querySelector('.trend')
        expect(trendElement).toHaveClass('positive')
        expect(trendElement).not.toHaveClass('negative')
    })

    it('should apply negative class for negative trend', () => {
        const { container } = render(
            <SimpleTrendCard
                title="Test Metric"
                value="100"
                trend={-5}
                trendData={mockTrendData}
            />,
        )

        const trendElement = container.querySelector('.trend')
        expect(trendElement).toHaveClass('negative')
        expect(trendElement).not.toHaveClass('positive')
    })

    it('should apply positive class for zero trend', () => {
        const { container } = render(
            <SimpleTrendCard
                title="Test Metric"
                value="100"
                trend={0}
                trendData={mockTrendData}
            />,
        )

        const trendElement = container.querySelector('.trend')
        expect(trendElement).toHaveClass('positive')
    })

    it('should render info icon', () => {
        const { container } = render(
            <SimpleTrendCard
                title="Test Metric"
                value="100"
                trend={5}
                trendData={mockTrendData}
            />,
        )

        const infoIcon = container.querySelector('[aria-label="info"]')
        expect(infoIcon).toBeInTheDocument()
    })

    it('should render chart with provided data', () => {
        const { container } = render(
            <SimpleTrendCard
                title="Test Metric"
                value="100"
                trend={5}
                trendData={mockTrendData}
            />,
        )

        const areaChart = container.querySelector('[class*="recharts"]')
        expect(areaChart).toBeInTheDocument()
    })

    it('should render with empty trend data', () => {
        render(
            <SimpleTrendCard
                title="Test Metric"
                value="100"
                trend={5}
                trendData={[]}
            />,
        )

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
    })
})
