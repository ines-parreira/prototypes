import { render, screen } from '@testing-library/react'

import { AnalyticsAiAgentDecreaseinFRTCard } from './AnalyticsAiAgentDecreaseinFRTCard'

describe('AnalyticsAiAgentDecreaseinFRTCard', () => {
    it('should render the card title', () => {
        render(<AnalyticsAiAgentDecreaseinFRTCard />)

        expect(
            screen.getByText('Decrease in first resolution time'),
        ).toBeInTheDocument()
    })

    it('should format and display duration correctly', () => {
        render(<AnalyticsAiAgentDecreaseinFRTCard />)

        expect(screen.getByText('1d 39m')).toBeInTheDocument()
    })

    it('should render hint tooltip icon', () => {
        render(<AnalyticsAiAgentDecreaseinFRTCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })
})
