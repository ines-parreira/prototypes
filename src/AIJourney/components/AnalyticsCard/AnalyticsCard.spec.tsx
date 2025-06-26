import { render, screen } from '@testing-library/react'

import { AnalyticsCard } from './AnalyticsCard'

jest.mock('AIJourney/components/DiscountCard/DiscountCard', () => ({
    DiscountCard: () => <div data-testid="discount-card" />,
}))

describe('<AnalyticsCard />', () => {
    it('renders live status with correct badge and icon', () => {
        render(<AnalyticsCard status="live" />)
        expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
        expect(screen.getByText('LIVE')).toBeInTheDocument()
        expect(screen.getByTestId('discount-card')).toBeInTheDocument()
        const img = screen.getByAltText('sphere-icon')
        expect(img).toBeInTheDocument()
    })

    it('renders paused status with correct badge and icon', () => {
        render(<AnalyticsCard status="paused" />)
        expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
        expect(screen.getByText('PAUSED')).toBeInTheDocument()
        expect(screen.getByTestId('discount-card')).toBeInTheDocument()
        const img = screen.getByAltText('sphere-icon')
        expect(img).toBeInTheDocument()
    })
})
