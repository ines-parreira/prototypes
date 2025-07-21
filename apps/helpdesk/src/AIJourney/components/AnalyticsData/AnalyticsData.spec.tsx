import { render, screen } from '@testing-library/react'

import { AnalyticsData } from './AnalyticsData'

jest.mock('../AnalyticsBarChart/AnalyticsBarChart', () => ({
    AnalyticsBarChart: () => <div data-testid="analytics-bar-chart" />,
}))
jest.mock('../AnalyticsMetricVariation/AnalyticsMetricVariation', () => ({
    AnalyticsMetricVariation: ({
        metricVariation,
    }: {
        metricVariation: string
    }) => <div data-testid="metric-variation">{metricVariation}</div>,
}))

const data = [
    { label: 'Revenue', value: '$999', variation: '+24%' },
    { label: 'Orders', value: '789', variation: '+9%' },
    { label: 'Conversion Rate', value: '9%', variation: '0%' },
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

    it('renders metric variations', () => {
        render(<AnalyticsData data={data} />)
        expect(screen.getByText('+24%')).toBeInTheDocument()
        expect(screen.getByText('+9%')).toBeInTheDocument()
        expect(screen.getByText('0%')).toBeInTheDocument()
    })
})
