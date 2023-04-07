import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {QueryClientProvider} from '@tanstack/react-query'
import TicketHeaderWrapper from 'pages/tickets/detail/components/TicketHeaderWrapper'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'

jest.mock('pages/tickets/detail/components/HistoryButton', () => () => (
    <div>HistoryButton</div>
))
jest.mock('pages/tickets/detail/components/TicketHeader', () => () => (
    <div>TicketHeader</div>
))

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

    it('should render history button, ticket header and separator', () => {
        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketHeaderWrapper {...minProps} />
                </Provider>
            </QueryClientProvider>
        )
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
