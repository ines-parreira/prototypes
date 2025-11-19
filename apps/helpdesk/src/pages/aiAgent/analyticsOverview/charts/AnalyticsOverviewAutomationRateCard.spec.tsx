import { render, screen } from '@testing-library/react'

import { AnalyticsOverviewAutomationRateCard } from './AnalyticsOverviewAutomationRateCard'

describe('AnalyticsOverviewAutomationRateCard', () => {
    it('should render the card title', () => {
        render(<AnalyticsOverviewAutomationRateCard />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should format and display percentage correctly', () => {
        render(<AnalyticsOverviewAutomationRateCard />)

        expect(screen.getByText('32%')).toBeInTheDocument()
    })

    it('should display trend percentage', () => {
        render(<AnalyticsOverviewAutomationRateCard />)

        expect(screen.getByText('2%')).toBeInTheDocument()
    })

    it('should render with positive trend indicator', () => {
        const { container } = render(<AnalyticsOverviewAutomationRateCard />)

        const trendingUpIcon = container.querySelector(
            '[aria-label="trending-up"]',
        )
        expect(trendingUpIcon).toBeInTheDocument()
    })
})
