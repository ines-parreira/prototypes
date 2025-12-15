import { render, screen } from '@testing-library/react'

import { AnalyticsAiAgentSupportInteractionsCard } from './AnalyticsAiAgentSupportInteractionsCard'

describe('AnalyticsAiAgentSupportInteractionsCard', () => {
    it('should render the card title', () => {
        render(<AnalyticsAiAgentSupportInteractionsCard />)

        expect(screen.getByText('Support interactions')).toBeInTheDocument()
    })

    it('should format and display decimal value correctly', () => {
        render(<AnalyticsAiAgentSupportInteractionsCard />)

        expect(screen.getByText('3,900')).toBeInTheDocument()
    })

    it('should render hint tooltip icon', () => {
        render(<AnalyticsAiAgentSupportInteractionsCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })
})
