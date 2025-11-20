import { render, screen } from '@testing-library/react'

import { AnalyticsOverviewAutomatedInteractionsCard } from './AnalyticsOverviewAutomatedInteractionsCard'

describe('AnalyticsOverviewAutomatedInteractionsCard', () => {
    it('should render the card title', () => {
        render(<AnalyticsOverviewAutomatedInteractionsCard />)

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    it('should format and display number with comma separator', () => {
        render(<AnalyticsOverviewAutomatedInteractionsCard />)

        expect(screen.getByText('4,800')).toBeInTheDocument()
    })
})
