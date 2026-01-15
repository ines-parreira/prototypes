import React from 'react'

import { Panels } from '@repo/layout'
import { render, screen } from '@testing-library/react'

import { SplitTicketViewProvider } from 'split-ticket-view-toggle'

import TicketDetailPanel from '../TicketDetailPanel'

jest.mock('split-ticket-view/components/TicketWrapper', () => () => (
    <div>TicketWrapper</div>
))

describe('TicketDetailPanel', () => {
    it('should render the ticket wrapper', () => {
        render(
            <SplitTicketViewProvider>
                <Panels size={1000}>
                    <TicketDetailPanel />
                </Panels>
            </SplitTicketViewProvider>,
        )
        expect(screen.getByText('TicketWrapper')).toBeInTheDocument()
    })
})
