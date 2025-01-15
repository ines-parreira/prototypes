import {render, screen} from '@testing-library/react'
import React from 'react'

import {Panels} from 'core/layout/panels'

import TicketInfobarPanel from '../TicketInfobarPanel'

jest.mock('pages/tickets/detail/TicketInfobarContainer', () => () => (
    <div>TicketInfobarContainer</div>
))

describe('TicketInfobarPanel', () => {
    it('should render the ticket infobar', () => {
        render(
            <Panels size={1000}>
                <TicketInfobarPanel />
            </Panels>
        )
        expect(screen.getByText('TicketInfobarContainer')).toBeInTheDocument()
    })
})
