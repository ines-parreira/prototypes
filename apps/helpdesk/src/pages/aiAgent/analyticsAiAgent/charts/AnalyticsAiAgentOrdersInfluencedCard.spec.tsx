import { render, screen } from '@testing-library/react'

import { AnalyticsAiAgentOrdersInfluencedCard } from './AnalyticsAiAgentOrdersInfluencedCard'

describe('AnalyticsAiAgentOrdersInfluencedCard', () => {
    it('should render the card title', () => {
        render(<AnalyticsAiAgentOrdersInfluencedCard />)

        expect(screen.getByText('Orders influenced')).toBeInTheDocument()
    })

    it('should format and display decimal value correctly', () => {
        render(<AnalyticsAiAgentOrdersInfluencedCard />)

        expect(screen.getByText('1,029')).toBeInTheDocument()
    })

    it('should render hint tooltip icon', () => {
        render(<AnalyticsAiAgentOrdersInfluencedCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })
})
