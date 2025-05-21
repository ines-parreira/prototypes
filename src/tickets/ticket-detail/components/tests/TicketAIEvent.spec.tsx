import { render, screen } from '@testing-library/react'

import { TicketEventEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import { TicketAIEvent } from '../TicketAIEvent'

describe('TicketAIEvent', () => {
    it('should dump data', () => {
        render(<TicketAIEvent data={{ eventType: TicketEventEnum.CLOSE }} />)
        expect(screen.getByTestId('dump')).toBeInTheDocument()
    })
})
