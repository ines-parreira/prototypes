import { render, screen } from '@testing-library/react'

import { AnalyticsAiAgentAutomationRateCard } from './AnalyticsAiAgentAutomationRateCard'

describe('AnalyticsAiAgentAutomationRateCard', () => {
    it('should render the card title', () => {
        render(<AnalyticsAiAgentAutomationRateCard />)

        expect(screen.getByText('Automation rate')).toBeInTheDocument()
    })

    it('should format and display percentage correctly', () => {
        render(<AnalyticsAiAgentAutomationRateCard />)

        expect(screen.getByText('28%')).toBeInTheDocument()
    })

    it('should render hint tooltip icon', () => {
        render(<AnalyticsAiAgentAutomationRateCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })
})
