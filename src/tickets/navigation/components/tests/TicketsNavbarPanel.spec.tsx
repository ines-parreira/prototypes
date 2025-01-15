import {render, screen} from '@testing-library/react'
import React from 'react'

import {Panels} from 'core/layout/panels'

import TicketsNavbarPanel from '../TicketsNavbarPanel'

jest.mock('pages/tickets/navbar/TicketNavbar', () => () => (
    <div>TicketNavbar</div>
))

describe('TicketsNavbarPanel', () => {
    it('should render the ticket navbar', () => {
        render(
            <Panels size={1000}>
                <TicketsNavbarPanel />
            </Panels>
        )
        expect(screen.getByText('TicketNavbar')).toBeInTheDocument()
    })
})
