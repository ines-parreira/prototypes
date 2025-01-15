import {render, screen} from '@testing-library/react'
import React from 'react'

import {Panels} from 'core/layout/panels'

import TicketDetailPanel from '../TicketDetailPanel'

jest.mock('split-ticket-view/components/TicketWrapper', () => () => (
    <div>TicketWrapper</div>
))

describe('TicketDetailPanel', () => {
    it('should render the ticket wrapper', () => {
        render(
            <Panels size={1000}>
                <TicketDetailPanel />
            </Panels>
        )
        expect(screen.getByText('TicketWrapper')).toBeInTheDocument()
    })
})
