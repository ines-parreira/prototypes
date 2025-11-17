import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

import MessageSourceFields from '../MessageSourceFields'

describe('<MessageSourceFields />', () => {
    const renderWithStore = (state: Partial<RootState>) =>
        render(
            <Provider store={mockStore(state as any)}>
                <MessageSourceFields />
            </Provider>,
        )

    describe('for a new ticket', () => {
        const initialState: Partial<RootState> = {
            newMessage: fromJS({
                newMessage: {
                    source: {
                        type: 'email',
                    },
                    public: true,
                },
            }),
            integrations: fromJS({
                integrations: [
                    {
                        id: 123,
                        type: 'email',
                        name: 'Support Email',
                        meta: {
                            address: 'support@acme.com',
                        },
                    },
                ],
            }),
        }

        it('renders the Internal Note label when new message is not public', () => {
            const { getByText } = renderWithStore({})

            expect(getByText('Internal note')).toBeInTheDocument()
        })

        it('renders in the open state with the correct fields for the email source', () => {
            const { getByText, getByPlaceholderText } =
                renderWithStore(initialState)

            expect(getByText('To:')).toBeInTheDocument()
            expect(getByText('From:')).toBeInTheDocument()
            expect(
                getByPlaceholderText('Search customers...'),
            ).toBeInTheDocument()
        })
    })

    describe('for an existing ticket', () => {
        const initialState: Partial<RootState> = {
            integrations: fromJS({
                integrations: [
                    {
                        id: 123,
                        type: 'email',
                        name: 'Support Email',
                        meta: {
                            address: 'support@acme.com',
                        },
                    },
                ],
            }),
            newMessage: fromJS({
                newMessage: {
                    source: {
                        type: 'email',
                        to: [
                            {
                                name: 'Mary',
                                address: 'mary@thecustomer.com',
                            },
                        ],
                    },
                    public: true,
                },
            }),
            ticket: fromJS({
                id: 123,
            }),
        }

        it('renders in the closed state with only the receiver visible', () => {
            const { getByText, queryByText, queryByPlaceholderText } =
                renderWithStore(initialState)

            expect(getByText('To:')).toBeInTheDocument()
            expect(getByText('Mary (mary@thecustomer.com)')).toBeInTheDocument()
            expect(queryByText('From:')).not.toBeInTheDocument()
            expect(
                queryByPlaceholderText('Search customers...'),
            ).not.toBeInTheDocument()
            expect(
                queryByText('Support Email (support@acme.com)'),
            ).not.toBeInTheDocument()
        })

        it('can be opened for sources that allow changing recipients', () => {
            const { getByText, queryByText } = renderWithStore(initialState)

            expect(getByText('To:')).toBeInTheDocument()
            expect(getByText('Mary (mary@thecustomer.com)')).toBeInTheDocument()

            expect(queryByText('From:')).not.toBeInTheDocument()

            fireEvent.click(getByText('To:'))

            expect(queryByText('From:')).toBeInTheDocument()
        })

        it('cannot be opened for sources that do not allow changing recipients', () => {
            const { getByText, queryByText } = renderWithStore({
                ...initialState,
                newMessage: fromJS({
                    integrations: fromJS({
                        integrations: [
                            {
                                id: 123,
                                type: 'whatsapp',
                                name: 'Support WhatsApp',
                            },
                        ],
                    }),
                    newMessage: {
                        source: {
                            type: 'whatsapp',
                            to: [
                                {
                                    name: 'Mary',
                                    address: '+1234599999',
                                },
                            ],
                        },
                        public: true,
                    },
                }),
            })

            expect(getByText('To:')).toBeInTheDocument()
            expect(getByText('Mary (+1234599999)')).toBeInTheDocument()

            expect(queryByText('From:')).not.toBeInTheDocument()

            fireEvent.click(getByText('To:'))

            expect(queryByText('From:')).not.toBeInTheDocument()
        })
    })

    describe('new selector UI', () => {
        const initialState: Partial<RootState> = {
            newMessage: fromJS({
                newMessage: {
                    source: {
                        type: 'email',
                    },
                    public: true,
                },
            }),
            integrations: fromJS({
                integrations: [
                    {
                        id: 123,
                        type: 'email',
                        name: 'Support Email',
                        meta: {
                            address: 'support@acme.com',
                        },
                    },
                ],
            }),
        }

        it('renders the new selector', () => {
            const { container, getByText } = renderWithStore(initialState)

            expect(getByText('To:')).toBeInTheDocument()
            expect(getByText('From:')).toBeInTheDocument()
            expect(container.querySelector('select')).not.toBeInTheDocument()
        })
    })
})
