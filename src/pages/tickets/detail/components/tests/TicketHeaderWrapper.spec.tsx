import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'
import TicketHeaderWrapper from 'pages/tickets/detail/components/TicketHeaderWrapper'

jest.mock('pages/tickets/detail/components/HistoryButton', () => () => (
    <div>HistoryButton</div>
))
jest.mock('pages/tickets/detail/components/TicketHeader', () => () => (
    <div>TicketHeader</div>
))
jest.mock(
    'pages/tickets/detail/components/TicketFields/TicketFields',
    () => () => <div>TicketFields</div>
)

const mockedServer = new MockAdapter(client)
const mockStore = configureMockStore([thunk])

describe('<TicketHeaderWrapper/>', () => {
    const minProps: ComponentProps<typeof TicketHeaderWrapper> = {
        hideTicket: jest.fn(),
        handleHistoryToggle: jest.fn(),
        setStatus: jest.fn(),
    }
    const defaultState = {
        currentUser: fromJS({}),
        ticket: fromJS({
            id: 123,
        }),
    }

    beforeEach(() => {
        mockedServer.reset()
    })

    it('should render history button, ticket header and separator, and ticket fields', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketHeaderWrapper {...minProps} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should hide history button when on a new ticket and not render separator', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    ticket: fromJS({}),
                })}
            >
                <TicketHeaderWrapper {...minProps} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
})
