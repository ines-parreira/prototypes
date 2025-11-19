import { render, screen } from '@testing-library/react'

import { AnalyticsOverviewCostSavedCard } from './AnalyticsOverviewCostSavedCard'

describe('AnalyticsOverviewCostSavedCard', () => {
    it('should render the card title', () => {
        render(<AnalyticsOverviewCostSavedCard />)

        expect(screen.getByText('Cost saved')).toBeInTheDocument()
    })

    it('should format and display currency correctly', () => {
        render(<AnalyticsOverviewCostSavedCard />)

        expect(screen.getByText('$2,400')).toBeInTheDocument()
    })

    it('should display trend percentage', () => {
        render(<AnalyticsOverviewCostSavedCard />)

        expect(screen.getByText('2%')).toBeInTheDocument()
    })

    it('should render with positive trend indicator', () => {
        const { container } = render(<AnalyticsOverviewCostSavedCard />)

        const trendingUpIcon = container.querySelector(
            '[aria-label="trending-up"]',
        )
        expect(trendingUpIcon).toBeInTheDocument()
    })
})
