import React from 'react'
import {fromJS} from 'immutable'
import {createStore} from 'redux'
import {Provider} from 'react-redux'
import {render, fireEvent, screen, act, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {RootState} from 'state/types'

import * as types from 'state/ticket/constants'
import useAppDispatch from 'hooks/useAppDispatch'
import {CustomerTimelineButton} from '../CustomerTimelineButton'

jest.mock('hooks/useAppDispatch', () => jest.fn())

const defaultState = {
    ticket: fromJS({id: 123, _internal: {displayHistory: false}}),
    customers: fromJS({
        _internal: {
            loading: {
                history: false,
            },
        },
        customerHistory: {
            hasHistory: true,
            tickets: [],
        },
    }),
} as RootState

describe('CustomerTimelineButton', () => {
    let dispatch: jest.Mock
    const useAppDispatchMock = useAppDispatch as jest.Mock

    beforeEach(() => {
        jest.resetAllMocks()

        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
    })

    it.each([true, false])(
        'should render the `Customer timeline` button and toggle the history display when clicked',
        (displayHistory) => {
            const state = {
                ...defaultState,
                ticket: defaultState.ticket.setIn(
                    ['_internal', 'displayHistory'],
                    displayHistory
                ),
            } as unknown as RootState
            const store = createStore((state) => state as RootState, state)

            render(
                <Provider store={store}>
                    <CustomerTimelineButton isEditing={false} />
                </Provider>
            )

            expect(
                screen.getByText(
                    displayHistory ? 'Close timeline' : 'Customer timeline'
                )
            ).toBeInTheDocument()
            // Secondary button -> there aren't open tickets
            expect(screen.getByRole('button')).toHaveClass('secondary')

            act(() => {
                fireEvent.click(screen.getByRole('button'))
            })

            expect(dispatch).toHaveBeenCalledTimes(1)
            expect(dispatch).toHaveBeenCalledWith({
                type: types.TOGGLE_HISTORY,
                state: !displayHistory,
            })
        }
    )

    it.each([true, false])(
        'should render the `Customer timeline` button along with the number of opened & closed tickets and toggle the history display when clicked',
        async (displayHistory) => {
            const state = {
                ...defaultState,
                ticket: defaultState.ticket.setIn(
                    ['_internal', 'displayHistory'],
                    displayHistory
                ),
                customers: defaultState.customers.setIn(
                    ['customerHistory', 'tickets'],
                    fromJS([
                        {
                            id: 123, // current ticket
                            status: 'open',
                        },
                        {
                            id: 124,
                            status: 'closed',
                        },
                        {
                            id: 125,
                            status: 'open',
                        },
                        {
                            id: 126,
                            status: 'open',
                        },
                        {
                            id: 127,
                            status: 'closed',
                        },
                    ])
                ),
            } as unknown as RootState
            const store = createStore((state) => state as RootState, state)

            render(
                <Provider store={store}>
                    <CustomerTimelineButton isEditing={false} />
                </Provider>
            )

            expect(
                screen.getByText(
                    displayHistory
                        ? 'Close timeline (2)'
                        : 'Customer timeline (2)'
                )
            ).toBeInTheDocument()
            // Primary button -> there are open tickets
            expect(screen.getByRole('button')).toHaveClass('primary')

            await waitFor(() => {
                userEvent.hover(
                    screen.getByText(
                        displayHistory
                            ? 'Close timeline (2)'
                            : 'Customer timeline (2)'
                    )
                )

                expect(screen.getByRole('tooltip').innerHTML).toEqual(
                    '2 open tickets<br>2 closed tickets'
                )
            })

            act(() => {
                fireEvent.click(screen.getByRole('button'))
            })

            expect(dispatch).toHaveBeenCalledTimes(1)
            expect(dispatch).toHaveBeenCalledWith({
                type: types.TOGGLE_HISTORY,
                state: !displayHistory,
            })
        }
    )

    it('should render the `Customer timeline` button as disabled and do nothing when clicked - customer does not have history', async () => {
        const state = {
            ...defaultState,
            customers: defaultState.customers.setIn(
                ['customerHistory', 'hasHistory'],
                false
            ),
        } as unknown as RootState
        const store = createStore((state) => state as RootState, state)

        render(
            <Provider store={store}>
                <CustomerTimelineButton isEditing={false} />
            </Provider>
        )

        expect(
            screen.getByRole('button', {name: /Customer timeline/})
        ).toBeAriaDisabled()
        // Secondary button -> there aren't open tickets
        expect(screen.getByRole('button')).toHaveClass('secondary')

        await waitFor(() => {
            userEvent.hover(screen.getByText('Customer timeline'))
            expect(
                screen.queryByText(
                    'This customer does not have any other tickets'
                )
            ).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByRole('button'))
        })

        expect(dispatch).toHaveBeenCalledTimes(0)
    })

    it('should render the `Customer timeline` button as disabled and do nothing when clicked - customer history is loading', async () => {
        const state = {
            ...defaultState,
            customers: defaultState.customers.setIn(
                ['_internal', 'loading', 'history'],
                true
            ),
        } as unknown as RootState
        const store = createStore((state) => state as RootState, state)

        render(
            <Provider store={store}>
                <CustomerTimelineButton isEditing={false} />
            </Provider>
        )

        expect(
            screen.getByRole('button', {name: /Customer timeline/})
        ).toBeAriaDisabled()
        // Secondary button -> there aren't open tickets
        expect(screen.getByRole('button')).toHaveClass('secondary')

        await waitFor(() => {
            userEvent.hover(screen.getByText('Customer timeline'))
            expect(
                screen.queryByText(
                    'This customer does not have any other tickets'
                )
            ).not.toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByRole('button'))
        })

        expect(dispatch).toHaveBeenCalledTimes(0)
    })

    it('should not render the `Customer timeline` button when in editing mode', () => {
        const store = createStore((state) => state as RootState, defaultState)

        render(
            <Provider store={store}>
                <CustomerTimelineButton isEditing={true} />
            </Provider>
        )

        expect(screen.queryByText('Customer timeline')).toBeNull()
        expect(screen.queryByText('Close timeline')).toBeNull()
    })

    it('should not render the `Customer timeline` button when ticket ID is missing', () => {
        const state = {
            ...defaultState,
            ticket: defaultState.ticket.set('id', null),
        } as unknown as RootState
        const store = createStore((state) => state as RootState, state)

        render(
            <Provider store={store}>
                <CustomerTimelineButton isEditing={false} />
            </Provider>
        )

        expect(screen.queryByText('Customer timeline')).toBeNull()
        expect(screen.queryByText('Close timeline')).toBeNull()
    })
})
