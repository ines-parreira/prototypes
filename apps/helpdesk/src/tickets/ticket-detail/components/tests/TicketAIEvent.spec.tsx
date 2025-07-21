import { render, screen } from '@testing-library/react'

import { TicketEventEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import { TicketAIEvent } from '../TicketAIEvent'

describe('TicketAIEvent', () => {
    it('should render a close event', () => {
        render(<TicketAIEvent data={{ eventType: TicketEventEnum.CLOSE }} />)
        expect(screen.getByText('check')).toBeInTheDocument()
        expect(screen.getByText('Closed')).toBeInTheDocument()
    })

    it('should render a handover event', () => {
        render(<TicketAIEvent data={{ eventType: TicketEventEnum.CLOSE }} />)
        expect(screen.getByText('check')).toBeInTheDocument()
        expect(screen.getByText('Closed')).toBeInTheDocument()
    })

    it('should render a snooze event', () => {
        render(<TicketAIEvent data={{ eventType: TicketEventEnum.CLOSE }} />)
        expect(screen.getByText('check')).toBeInTheDocument()
        expect(screen.getByText('Closed')).toBeInTheDocument()
    })
})
