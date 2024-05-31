import React from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import {defaultStatsFilters} from 'state/stats/reducers'
import {StatsFilters} from 'models/stat/types'
import {RootState, StoreDispatch} from 'state/types'
import {user} from 'fixtures/users'

import DefaultStatsFilters from '../DefaultStatsFilters'

jest.mock('moment-timezone', () => () => {
    const moment: (date: string) => Record<string, unknown> =
        jest.requireActual('moment-timezone')

    return moment('2019-09-03')
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('DefaultStatsFilters', () => {
    const defaultState = {
        currentUser: fromJS({
            ...user,
            timezone: 'America/Los_Angeles',
        }),
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            } as StatsFilters,
        }),
    } as RootState

    it('should render children when stats filters are not the default stats filters', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <DefaultStatsFilters>
                    <div>Foo bar</div>
                </DefaultStatsFilters>
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the fallback when stats filters are the default stats filters', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    stats: fromJS({
                        filters: defaultStatsFilters,
                    }),
                })}
            >
                <DefaultStatsFilters notReadyFallback={<div>fallback</div>}>
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
