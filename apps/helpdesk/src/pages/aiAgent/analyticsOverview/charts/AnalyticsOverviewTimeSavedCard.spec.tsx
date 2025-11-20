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

    it('should render hint tooltip icon', () => {
        render(<AnalyticsOverviewTimeSavedCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })
})
