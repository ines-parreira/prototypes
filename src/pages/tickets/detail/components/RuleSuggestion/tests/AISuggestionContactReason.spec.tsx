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

describe('<AISuggestionContactReason />', () => {
    it.each([
        {
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
        },
        {
            customFieldId: {
                value: 'Order::Request',
                prediction: {
                    predicted: 'Order::Cancel',
                    confidence: 80,
                    display: true,
                    confirmed: false,
                    modified: false,
                },
                id: customFieldId,
            },
        },
        {
            customFieldId: {
                value: 'Order::Request',
                prediction: {
                    predicted: 'Order::Request',
                    confidence: 80,
                    display: false,
                    confirmed: false,
                    modified: false,
                },
                id: customFieldId,
            },
        },
        {
            customFieldId: {
                value: 'Order::Request',
                prediction: {
                    predicted: 'Order::Request',
                    confidence: 80,
                    display: true,
                    confirmed: true,
                    modified: false,
                },
                id: customFieldId,
            },
        },
        {
            customFieldId: {
                value: 'Order::Request',
                prediction: {
                    predicted: 'Order::Request',
                    confidence: 80,
                    display: true,
                    confirmed: false,
                    modified: true,
                },
                id: customFieldId,
            },
        },
    ])('should match snapshot for prediction ', (customFields) => {
        const ticket = {
            ...emailTicket.toJS(),
            id: ticketId,
            custom_fields: customFields,
        }
        const store = mockStore({
            ticket: fromJS(ticket),
            state: fromJS({custom_fields: customFields}),
        })
        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AISuggestionContactReason
                        ticket={{
                            ...emailTicket.toJS(),
                            id: ticketId,
                            custom_fields: customFields,
                        }}
                    />
                </Provider>
            </QueryClientProvider>
        )
        expect(container).toMatchSnapshot()
        expect(mockStore)
    })

    it('should display feeback message ', async () => {
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
        const store = mockStore({
            ticket: fromJS(ticket),
            state: fromJS({custom_fields: customFields}),
        })
        jest.useFakeTimers()
        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(store)}>
                    <AISuggestionContactReason ticket={ticket} />
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
        expect(container).toMatchSnapshot()
    })
})
