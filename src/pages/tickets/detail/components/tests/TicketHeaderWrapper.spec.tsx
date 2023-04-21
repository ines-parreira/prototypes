import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {render, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import {QueryClientProvider} from '@tanstack/react-query'

import client from 'models/api/resources'
import TicketHeaderWrapper from 'pages/tickets/detail/components/TicketHeaderWrapper'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import {
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'

jest.mock('pages/tickets/detail/components/HistoryButton', () => () => (
    <div>HistoryButton</div>
))
jest.mock('pages/tickets/detail/components/TicketHeader', () => () => (
    <div>TicketHeader</div>
))

const mockedServer = new MockAdapter(client)
const mockStore = configureMockStore([thunk])
const queryClient = createTestQueryClient()

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

    it('should render history button, ticket header and separator, and ticket fields', async () => {
        mockedServer.onGet('/api/custom-fields/').reply(200, {
            data: [ticketDropdownFieldDefinition, ticketInputFieldDefinition],
        })
        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketHeaderWrapper {...minProps} />
                </Provider>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByText(RegExp(ticketInputFieldDefinition.label)))
        })
        expect(container).toMatchSnapshot()
    })

    it('should hide history button when on a new ticket and not render separator', () => {
        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider
                    store={mockStore({
                        ...defaultState,
                        ticket: fromJS({}),
                    })}
                >
                    <TicketHeaderWrapper {...minProps} />
                </Provider>
            </QueryClientProvider>
        )
        expect(container).toMatchSnapshot()
    })
})
