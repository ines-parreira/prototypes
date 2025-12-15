import { render, screen } from '@testing-library/react'

import { AnalyticsAiAgentRevenuePerInteractionCard } from './AnalyticsAiAgentRevenuePerInteractionCard'

describe('AnalyticsAiAgentRevenuePerInteractionCard', () => {
    it('should render the card title', () => {
        render(<AnalyticsAiAgentRevenuePerInteractionCard />)

        expect(screen.getByText('Revenue per interaction')).toBeInTheDocument()
    })

    it('should format and display currency correctly', () => {
        render(<AnalyticsAiAgentRevenuePerInteractionCard />)

        expect(screen.getByText('$93')).toBeInTheDocument()
    })

    it('should render hint tooltip icon', () => {
        render(<AnalyticsAiAgentRevenuePerInteractionCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })
})
