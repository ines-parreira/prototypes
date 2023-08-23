import React from 'react'

import {fireEvent, screen, render, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {QueryClientProvider} from '@tanstack/react-query'
import {emailTicket} from 'state/ticket/tests/fixtures'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import AISuggestionContactReason from '../AISuggestionContactReason'

const queryClient = createTestQueryClient()

const mockStore = configureMockStore([thunk])

const ticketId = 1
const customFieldId = 1

const customFields = {
    customFieldId: {
        value: 'Order::Request',
        prediction: {
            predicted: 'Order::Request',
            confidence: 80,
            display: true,
            confirmed: false,
            modified: false,
        },
        id: customFieldId,
    },
}

const ticket = {
    ...emailTicket.toJS(),
    id: ticketId,
    custom_fields: customFields,
}

const defaultState = {
    ticket: fromJS(ticket),
    state: fromJS({custom_fields: customFields}),
}

const minProps = {
    ticket,
}

let store = mockStore(defaultState)

describe('<AISuggestionContactReason />', () => {
    beforeEach(() => {
        store = mockStore(defaultState)
        store.dispatch = jest.fn()
        queryClient.clear()
    })

    it('should match snapshot', () => {
        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(store)}>
                    <AISuggestionContactReason {...minProps} />
                </Provider>
            </QueryClientProvider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should display feeback message ', async () => {
        jest.useFakeTimers()
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(store)}>
                    <AISuggestionContactReason {...minProps} />
                </Provider>
            </QueryClientProvider>
        )
        fireEvent.click(screen.getByText(/Confirm/))
        jest.runAllTimers()
        await waitFor(() =>
            expect(
                screen.getByText('Thanks for the feedback!')
            ).toBeInTheDocument()
        )
    })
})
