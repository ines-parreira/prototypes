import {render, screen} from '@testing-library/react'
import React from 'react'

import {TicketEventEnum} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import TicketEvent from '../TicketEvent'

describe('TicketEvent', () => {
    it('renders the correct event type label', () => {
        render(
            <TicketEvent
                eventType={TicketEventEnum.CLOSE}
                isFirst={true}
                isLast={true}
            />
        )
        expect(screen.getByText('Closed')).toBeInTheDocument()
    })
})
