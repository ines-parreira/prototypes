import React from 'react'

import { render, screen } from '@testing-library/react'

import { Panels } from 'core/layout/panels'

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
