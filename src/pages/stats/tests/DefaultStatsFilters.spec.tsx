import React from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import DefaultStatsFilters from '../DefaultStatsFilters'
import {RootState, StoreDispatch} from '../../../state/types'
import {user} from '../../../fixtures/users'

jest.mock('moment-timezone', () => () => {
    const moment: (
        date: string
    ) => Record<string, unknown> = jest.requireActual('moment-timezone')

    return moment('2019-09-03')
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('DefaultStatsFilters', () => {
    const defaultState = {
        currentUser: fromJS({
            ...user,
            timezone: 'America/Los_Angeles',
        }),
    } as RootState

    it('should render children', () => {
        const store = mockStore(defaultState)

        const {container} = render(
            <Provider store={store}>
                <DefaultStatsFilters>
                    <div>Foo bar</div>
                </DefaultStatsFilters>
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should set the default filters on mount', () => {
        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <DefaultStatsFilters />
            </Provider>
        )

        expect(store.getActions()).toMatchSnapshot()
    })

    it('should set the default period using user timezone ', () => {
        const store = mockStore({
            ...defaultState,
            currentUser: defaultState.currentUser.set(
                'timezone',
                'Europe/Paris'
            ),
        })

        render(
            <Provider store={store}>
                <DefaultStatsFilters />
            </Provider>
        )

        expect(store.getActions()).toMatchSnapshot()
    })

    it('should reset the filters on unmount', () => {
        const store = mockStore(defaultState)

        const {unmount} = render(
            <Provider store={store}>
                <DefaultStatsFilters>
                    <div>Foo bar</div>
                </DefaultStatsFilters>
            </Provider>
        )
        unmount()

        expect(store.getActions()).toMatchSnapshot()
    })
})
