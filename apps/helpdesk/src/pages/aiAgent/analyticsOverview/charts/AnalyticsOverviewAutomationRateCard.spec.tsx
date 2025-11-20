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

    it('should render hint tooltip icon', () => {
        render(<AnalyticsOverviewAutomationRateCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })
})
