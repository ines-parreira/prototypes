import React from 'react'

import { screen } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { Panels } from 'core/layout/panels'
import Provider from 'split-ticket-view-toggle/components/Provider'
import { renderWithRouter } from 'utils/testing'

import TicketsNavbarPanel from '../TicketsNavbarPanel'

jest.mock('pages/tickets/navbar/TicketNavbar', () => () => (
    <div>TicketNavbar</div>
))
const mockStore = configureMockStore([thunk])()

describe('TicketsNavbarPanel', () => {
    it('should render the ticket navbar', () => {
        renderWithRouter(
            <ReduxProvider store={mockStore}>
                <Provider>
                    <NavBarProvider>
                        <Panels size={1000}>
                            <TicketsNavbarPanel />
                        </Panels>
                    </NavBarProvider>
                </Provider>
            </ReduxProvider>,
        )
        expect(screen.getByText('TicketNavbar')).toBeInTheDocument()
    })
})
