import { render, screen } from '@testing-library/react'

import { AnalyticsAiAgentAutomatedInteractionsCard } from './AnalyticsAiAgentAutomatedInteractionCard'

describe('AnalyticsAiAgentAutomatedInteractionsCard', () => {
    it('should render the card title', () => {
        render(<AnalyticsAiAgentAutomatedInteractionsCard />)

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    it('should format and display decimal value correctly', () => {
        render(<AnalyticsAiAgentAutomatedInteractionsCard />)

        expect(screen.getByText('6,200')).toBeInTheDocument()
    })

    it('should render hint tooltip icon', () => {
        render(<AnalyticsAiAgentAutomatedInteractionsCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })
})
