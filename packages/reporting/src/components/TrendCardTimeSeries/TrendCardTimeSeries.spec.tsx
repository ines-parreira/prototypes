import { render, screen } from '@testing-library/react'

import type { TrendCardTimeSeriesProps } from './TrendCardTimeSeries'
import { TrendCardTimeSeries } from './TrendCardTimeSeries'

const mockData = [
    { date: '2024-01-01', value: 10 },
    { date: '2024-01-02', value: 20 },
    { date: '2024-01-03', value: 15 },
]

const defaultProps: TrendCardTimeSeriesProps = {}

describe('TrendCardTimeSeries', () => {
    it('should render "Trend view coming soon" when useChartData is not provided', () => {
        render(<TrendCardTimeSeries {...defaultProps} />)

        expect(screen.getByText('Trend view coming soon')).toBeInTheDocument()
    })

    it('should render "Trend view coming soon" when comingSoon is true', () => {
        const useChartData = () => ({ data: mockData, isLoading: false })

        render(
            <TrendCardTimeSeries
                {...defaultProps}
                comingSoon
                useChartData={useChartData}
            />,
        )

        expect(screen.getByText('Trend view coming soon')).toBeInTheDocument()
    })

    it('should render a divider', () => {
        const { container } = render(<TrendCardTimeSeries {...defaultProps} />)

        expect(container.querySelector('hr')).toBeInTheDocument()
    })

    it('should render loading skeleton when useChartData returns isLoading true', () => {
        const useChartData = () => ({ data: [], isLoading: true })

        render(
            <TrendCardTimeSeries
                {...defaultProps}
                useChartData={useChartData}
            />,
        )

        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })

    it('should render chart when useChartData returns data with isLoading false', () => {
        const useChartData = () => ({ data: mockData, isLoading: false })

        const { container } = render(
            <TrendCardTimeSeries
                {...defaultProps}
                useChartData={useChartData}
            />,
        )

        expect(
            container.querySelector('.recharts-responsive-container'),
        ).toBeInTheDocument()
    })
})
