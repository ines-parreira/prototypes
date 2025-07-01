import { render, screen } from '@testing-library/react'

import { AnalyticsCard } from './AnalyticsCard'

jest.mock('AIJourney/components/DiscountCard/DiscountCard', () => ({
    DiscountCard: () => <div data-testid="discount-card" />,
}))

const data = [
    { label: 'Revenue', value: '$999', variation: '+24%' },
    { label: 'Orders', value: '789', variation: '+9%' },
    { label: 'Conversion Rate', value: '9%', variation: '0%' },
]

describe('<AnalyticsCard />', () => {
    it('renders live status with correct badge and icon', () => {
        render(<AnalyticsCard analyticsData={data} status="live" />)
        expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
        expect(screen.getByText('LIVE')).toBeInTheDocument()
        expect(screen.getByTestId('discount-card')).toBeInTheDocument()
        const img = screen.getByAltText('sphere-icon')
        expect(img).toBeInTheDocument()
    })

    it('renders paused status with correct badge and icon', () => {
        render(<AnalyticsCard analyticsData={data} status="paused" />)
        expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
        expect(screen.getByTestId('discount-card')).toBeInTheDocument()
    })
})
