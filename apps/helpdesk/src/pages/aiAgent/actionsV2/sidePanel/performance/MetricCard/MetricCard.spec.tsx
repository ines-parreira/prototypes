import { render } from '@repo/testing'

import { MetricCard } from './MetricCard'

describe('MetricCard', () => {
    it('renders the label and value', () => {
        const { getByText } = render(
            <MetricCard label="Ticket volume" value="1,335" />,
        )
        expect(getByText('Ticket volume')).toBeInTheDocument()
        expect(getByText('1,335')).toBeInTheDocument()
    })

    it('renders a trend with direction encoded as data attribute', () => {
        const { getByLabelText } = render(
            <MetricCard
                label="CSAT"
                value="4.6"
                trend={{ value: '+0.2', direction: 'up' }}
            />,
        )
        const trend = getByLabelText('Trend up +0.2')
        expect(trend).toHaveAttribute('data-direction', 'up')
    })

    it('renders the action chip beside the value', () => {
        const { getByText } = render(
            <MetricCard
                label="Action success rate"
                value="88%"
                actionChip={{ name: 'Cancel order' }}
            />,
        )
        expect(getByText('88%')).toBeInTheDocument()
        expect(getByText('Cancel order')).toBeInTheDocument()
    })

    it('renders the loading skeleton', () => {
        const { container } = render(
            <MetricCard label="CSAT" value="" isLoading />,
        )
        expect(
            container.querySelectorAll('[data-name="skeleton"]').length,
        ).toBeGreaterThan(0)
    })
})
