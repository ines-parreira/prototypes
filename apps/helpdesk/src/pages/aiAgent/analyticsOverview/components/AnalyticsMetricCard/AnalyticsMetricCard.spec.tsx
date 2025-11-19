import { render, screen } from '@testing-library/react'

import { AnalyticsMetricCard } from './AnalyticsMetricCard'

describe('AnalyticsMetricCard', () => {
    it('should render title and value', () => {
        render(
            <AnalyticsMetricCard title="Test Metric" value="100" trend={5} />,
        )

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should render positive trend with trending-up icon', () => {
        const { container } = render(
            <AnalyticsMetricCard title="Test Metric" value="100" trend={5} />,
        )

        expect(screen.getByText('5%')).toBeInTheDocument()
        const trendingUpIcon = container.querySelector(
            '[aria-label="trending-up"]',
        )
        expect(trendingUpIcon).toBeInTheDocument()
    })

    it('should render negative trend with trending-down icon', () => {
        const { container } = render(
            <AnalyticsMetricCard title="Test Metric" value="100" trend={-5} />,
        )

        expect(screen.getByText('5%')).toBeInTheDocument()
        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should render zero trend with trending-up icon', () => {
        const { container } = render(
            <AnalyticsMetricCard title="Test Metric" value="100" trend={0} />,
        )

        expect(screen.getByText('0%')).toBeInTheDocument()
        const trendingUpIcon = container.querySelector(
            '[aria-label="trending-up"]',
        )
        expect(trendingUpIcon).toBeInTheDocument()
    })

    it('should display trend as absolute value', () => {
        render(
            <AnalyticsMetricCard title="Test Metric" value="100" trend={-15} />,
        )

        expect(screen.getByText('15%')).toBeInTheDocument()
    })

    it('should apply positive trend styles', () => {
        render(
            <AnalyticsMetricCard title="Test Metric" value="100" trend={5} />,
        )

        const trendText = screen.getByText('5%')
        expect(trendText).toHaveClass('trendTextPositive')
    })

    it('should apply negative trend styles', () => {
        render(
            <AnalyticsMetricCard title="Test Metric" value="100" trend={-5} />,
        )

        const trendText = screen.getByText('5%')
        expect(trendText).toHaveClass('trendTextNegative')
    })

    it('should apply neutral trend styles for zero', () => {
        render(
            <AnalyticsMetricCard title="Test Metric" value="100" trend={0} />,
        )

        const trendText = screen.getByText('0%')
        expect(trendText).toHaveClass('trendTextNeutral')
    })

    it('should render info icon', () => {
        const { container } = render(
            <AnalyticsMetricCard title="Test Metric" value="100" trend={5} />,
        )

        const infoIcon = container.querySelector('[aria-label="info"]')
        expect(infoIcon).toBeInTheDocument()
    })

    it('should render with formatted currency value', () => {
        render(
            <AnalyticsMetricCard title="Cost Saved" value="$2,400" trend={3} />,
        )

        expect(screen.getByText('$2,400')).toBeInTheDocument()
    })

    it('should render with percentage value', () => {
        render(
            <AnalyticsMetricCard
                title="Automation Rate"
                value="32%"
                trend={2}
            />,
        )

        expect(screen.getByText('32%')).toBeInTheDocument()
    })

    it('should render with time duration value', () => {
        render(
            <AnalyticsMetricCard
                title="Time Saved"
                value="5h 30m"
                trend={-1}
            />,
        )

        expect(screen.getByText('5h 30m')).toBeInTheDocument()
    })

    it('should render with large positive trend', () => {
        render(
            <AnalyticsMetricCard title="Test Metric" value="100" trend={99} />,
        )

        expect(screen.getByText('99%')).toBeInTheDocument()
    })

    it('should render with large negative trend', () => {
        render(
            <AnalyticsMetricCard title="Test Metric" value="100" trend={-99} />,
        )

        expect(screen.getByText('99%')).toBeInTheDocument()
    })

    it('should render with decimal trend value', () => {
        render(
            <AnalyticsMetricCard title="Test Metric" value="100" trend={2.5} />,
        )

        expect(screen.getByText('2.5%')).toBeInTheDocument()
    })
})
