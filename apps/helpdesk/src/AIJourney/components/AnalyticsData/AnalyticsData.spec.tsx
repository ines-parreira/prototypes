import { render, screen } from '@testing-library/react'

import { AnalyticsData } from './AnalyticsData'

jest.mock('../AnalyticsBarChart/AnalyticsBarChart', () => ({
    AnalyticsBarChart: () => <div data-testid="analytics-bar-chart" />,
}))

const data = [
    { label: 'Revenue', value: '$999' },
    { label: 'Orders', value: '789' },
    { label: 'Conversion Rate', value: '9%' },
]

describe('<AnalyticsData />', () => {
    it('renders all digest metrics', () => {
        render(<AnalyticsData data={data} />)
        expect(screen.getByText('Revenue')).toBeInTheDocument()
        expect(screen.getByText('Orders')).toBeInTheDocument()
        expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
    })

    it('renders metric values', () => {
        render(<AnalyticsData data={data} />)
        expect(screen.getByText('$999')).toBeInTheDocument()
        expect(screen.getByText('789')).toBeInTheDocument()
        expect(screen.getByText('9%')).toBeInTheDocument()
    })

    it('renders a bar chart for each metric', () => {
        render(<AnalyticsData data={data} />)
        expect(screen.getAllByTestId('analytics-bar-chart').length).toBe(3)
    })
})
