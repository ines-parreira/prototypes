import {render, screen} from '@testing-library/react'
import React from 'react'

import {Panels} from 'core/layout/panels'

import ViewPanel from '../ViewPanel'

jest.mock('pages/tickets/list/TicketList', () =>
    jest.fn(() => <div>TicketList</div>)
)

describe('ViewPanel', () => {
    it('should render the ticket list', () => {
        render(
            <Panels size={1000}>
                <ViewPanel />
            </Panels>
        )
        expect(screen.getByText('TicketList')).toBeInTheDocument()
    })
})
