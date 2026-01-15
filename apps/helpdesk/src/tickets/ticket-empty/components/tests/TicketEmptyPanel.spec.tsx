import React from 'react'

import { Panels } from '@repo/layout'
import { render, screen } from '@testing-library/react'

import TicketEmptyPanel from '../TicketEmptyPanel'

jest.mock('ticket-page', () => ({
    EmptyTicket: () => <div>TicketWrapper</div>,
}))

describe('TicketEmptyPanel', () => {
    it('should render the empty ticket', () => {
        render(
            <Panels size={1000}>
                <TicketEmptyPanel />
            </Panels>,
        )
        expect(screen.getByText('TicketWrapper')).toBeInTheDocument()
    })
})
