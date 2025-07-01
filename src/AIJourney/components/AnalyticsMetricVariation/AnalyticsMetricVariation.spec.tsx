import { render, screen } from '@testing-library/react'

import { AnalyticsMetricVariation } from './AnalyticsMetricVariation'

describe('<AnalyticsMetricVariation />', () => {
    it('renders the variation value', () => {
        render(<AnalyticsMetricVariation metricVariation="+10%" />)
        expect(screen.getByText('+10%')).toBeInTheDocument()
    })

    it('applies negative class and shows downward arrow for negative variation', () => {
        render(<AnalyticsMetricVariation metricVariation="-5%" />)
        const variation = screen.getByText('-5%').parentElement
        expect(variation?.className).toMatch(/metricVariation--negative/)
        expect(screen.getByText('arrow_downward')).toBeInTheDocument()
    })

    it('applies neutral class and shows no arrow for zero variation', () => {
        render(<AnalyticsMetricVariation metricVariation="0%" />)
        const variation = screen.getByText('0%').parentElement
        expect(variation?.className).toMatch(/metricVariation--neutral/)
        expect(screen.queryByText('arrow_upward')).not.toBeInTheDocument()
        expect(screen.queryByText('arrow_downward')).not.toBeInTheDocument()
    })

    it('shows upward arrow for positive variation', () => {
        render(<AnalyticsMetricVariation metricVariation="+8%" />)
        expect(screen.getByText('arrow_upward')).toBeInTheDocument()
    })
})
