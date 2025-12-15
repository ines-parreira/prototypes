import { render, screen } from '@testing-library/react'

import { AnalyticsAiAgentTotalSalesCard } from './AnalyticsAiAgentTotalSalesCard'

describe('AnalyticsAiAgentTotalSalesCard', () => {
    it('should render the card title', () => {
        render(<AnalyticsAiAgentTotalSalesCard />)

        expect(screen.getByText('Total sales')).toBeInTheDocument()
    })

    it('should format and display currency correctly', () => {
        render(<AnalyticsAiAgentTotalSalesCard />)

        expect(screen.getByText('$7,800')).toBeInTheDocument()
    })

    it('should render hint tooltip icon', () => {
        render(<AnalyticsAiAgentTotalSalesCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })
})
