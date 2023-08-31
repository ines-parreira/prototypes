import React from 'react'
import {fromJS} from 'immutable'
import {createStore} from 'redux'
import {Provider} from 'react-redux'
import {render, fireEvent, screen, act} from '@testing-library/react'
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
        customerHistory: {hasHistory: true},
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

    it('should render the `Customer timeline` button as disabled and do nothing when clicked - customer does not have history', () => {
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
        ).toHaveAttribute('aria-disabled', 'true')
        act(() => {
            fireEvent.click(screen.getByRole('button'))
        })

        expect(dispatch).toHaveBeenCalledTimes(0)
    })

    it('should render the `Customer timeline` button as disabled and do nothing when clicked - customer history is loading', () => {
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
        ).toHaveAttribute('aria-disabled', 'true')
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
