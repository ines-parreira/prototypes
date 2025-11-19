import { render, screen } from '@testing-library/react'

import { AnalyticsOverviewTimeSavedCard } from './AnalyticsOverviewTimeSavedCard'

describe('AnalyticsOverviewTimeSavedCard', () => {
    it('should render the card title', () => {
        render(<AnalyticsOverviewTimeSavedCard />)

        expect(screen.getByText('Time saved by agents')).toBeInTheDocument()
    })

    it('should format and display duration correctly', () => {
        render(<AnalyticsOverviewTimeSavedCard />)

        expect(screen.getByText('5h 30m')).toBeInTheDocument()
    })

    it('should display trend percentage', () => {
        render(<AnalyticsOverviewTimeSavedCard />)

        expect(screen.getByText('2%')).toBeInTheDocument()
    })

    it('should render with positive trend indicator', () => {
        const { container } = render(<AnalyticsOverviewTimeSavedCard />)

        const trendingUpIcon = container.querySelector(
            '[aria-label="trending-up"]',
        )
        expect(trendingUpIcon).toBeInTheDocument()
    })
})
