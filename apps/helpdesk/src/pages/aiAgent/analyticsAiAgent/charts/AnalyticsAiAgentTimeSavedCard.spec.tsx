import { render, screen } from '@testing-library/react'

import { AnalyticsAiAgentTimeSavedCard } from './AnalyticsAiAgentTimeSavedCard'

describe('AnalyticsAiAgentTimeSavedCard', () => {
    it('should render the card title', () => {
        render(<AnalyticsAiAgentTimeSavedCard />)

        expect(screen.getByText('Time saved by agents')).toBeInTheDocument()
    })

    it('should format and display duration correctly', () => {
        render(<AnalyticsAiAgentTimeSavedCard />)

        expect(screen.getByText('5h 45m')).toBeInTheDocument()
    })

    it('should render hint tooltip icon', () => {
        render(<AnalyticsAiAgentTimeSavedCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })
})
