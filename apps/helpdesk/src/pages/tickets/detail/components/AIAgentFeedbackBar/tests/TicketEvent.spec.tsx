import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { TicketEventEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import { TicketEvent } from '../TicketEvent'

describe('TicketEvent', () => {
    it('renders the correct event type label', () => {
        render(
            <TicketEvent
                eventType={TicketEventEnum.CLOSE}
                isFirst={true}
                isLast={true}
            />,
        )
        expect(screen.getByText('Closed')).toBeInTheDocument()
    })
})
