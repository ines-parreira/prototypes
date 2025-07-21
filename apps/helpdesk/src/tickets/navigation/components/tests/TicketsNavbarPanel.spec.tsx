import React from 'react'

import { render, screen } from '@testing-library/react'

import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { Panels } from 'core/layout/panels'

import TicketsNavbarPanel from '../TicketsNavbarPanel'

jest.mock('pages/tickets/navbar/TicketNavbar', () => () => (
    <div>TicketNavbar</div>
))

describe('TicketsNavbarPanel', () => {
    it('should render the ticket navbar', () => {
        render(
            <NavBarProvider>
                <Panels size={1000}>
                    <TicketsNavbarPanel />
                </Panels>
            </NavBarProvider>,
        )
        expect(screen.getByText('TicketNavbar')).toBeInTheDocument()
    })
})
