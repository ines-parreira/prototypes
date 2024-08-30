import {fromJS} from 'immutable'
import React from 'react'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {view} from 'fixtures/views'

import ViewSelection from '../ViewSelection'

const mockStore = configureMockStore()
const state = {
    views: fromJS({
        active: view,
        counts: {
            [view.id]: 888,
        },
    }),
}

describe('<ViewSelection />', () => {
    const minProps = {
        colSize: 5,
        selectedCount: 30,
        onSelectViewClick: jest.fn(),
        viewSelected: false,
    }

    describe('render()', () => {
        it('should render when only a subset of the active view is selected', () => {
            render(
                <Provider store={mockStore(state)}>
                    <ViewSelection {...minProps} />
                </Provider>
            )

            expect(screen.getByText(/on this page/).textContent).toBe(
                '30 tickets on this page are selected. Select all 888 tickets of the "New & Open Tickets" view'
            )
        })

        it('should render when the entire view is selected', () => {
            render(
                <Provider store={mockStore(state)}>
                    <ViewSelection {...minProps} viewSelected={true} />
                </Provider>
            )
            expect(screen.getByText(/All the/).textContent).toBe(
                'All the 888 tickets of "New & Open Tickets" view are selected. Select all tickets of the current page instead'
            )
        })

        it('should not render view counts when view is dirty', () => {
            render(
                <Provider
                    store={mockStore({
                        views: fromJS({
                            active: {...view, dirty: true},
                            counts: {
                                [view.id]: 888,
                            },
                        }),
                    })}
                >
                    <ViewSelection {...minProps} />
                </Provider>
            )

            expect(screen.getByText(/on this page/).textContent).toBe(
                '30 tickets on this page are selected. Select all tickets from the current view'
            )
        })

        it('should render singular noun', () => {
            render(
                <Provider store={mockStore(state)}>
                    <ViewSelection {...minProps} selectedCount={1} />
                </Provider>
            )

            expect(screen.getByText(/on this page/).textContent).toBe(
                '1 ticket on this page is selected. Select all 888 tickets of the "New & Open Tickets" view'
            )
        })
    })
})
