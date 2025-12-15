import { render, screen } from '@testing-library/react'

import { AnalyticsAiAgentResolvedInteractionsCard } from './AnalyticsAiAgentResolvedInteractionsCard'

describe('AnalyticsAiAgentResolvedInteractionsCard', () => {
    it('should render the card title', () => {
        render(<AnalyticsAiAgentResolvedInteractionsCard />)

        expect(screen.getByText('Resolved interactions')).toBeInTheDocument()
    })

    it('should format and display decimal value correctly', () => {
        render(<AnalyticsAiAgentResolvedInteractionsCard />)

        expect(screen.getByText('2,300')).toBeInTheDocument()
    })

    it('should render hint tooltip icon', () => {
        render(<AnalyticsAiAgentResolvedInteractionsCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })
})
