import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useCurrentFilters from 'domains/reporting/hooks/useCurrentFilters'
import DefaultStatsFilters from 'domains/reporting/pages/DefaultStatsFilters'
import { defaultStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import { user } from 'fixtures/users'
import { RootState, StoreDispatch } from 'state/types'

jest.mock('moment-timezone', () => () => {
    const moment: (date: string) => Record<string, unknown> =
        jest.requireActual('moment-timezone')

    return moment('2019-09-03')
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
jest.mock('domains/reporting/hooks/useCurrentFilters')
const useCurrentFiltersMock = assumeMock(useCurrentFilters)
const persistFiltersMock = jest.fn()

describe('DefaultStatsFilters', () => {
    const periodFilter = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
    }

    const defaultState = {
        currentUser: fromJS({
            ...user,
            timezone: 'America/Los_Angeles',
        }),
        stats: {
            filters: periodFilter,
        },
        ui: {
            stats: {
                filters: {
                    isFilterDirty: false,
                },
            },
        },
    } as RootState

    useCurrentFiltersMock.mockReturnValue({
        filters: periodFilter,
        persistFilters: persistFiltersMock,
    })

    it('should render children when stats filters are not the default stats filters', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <DefaultStatsFilters>
                    <div>Foo bar</div>
                </DefaultStatsFilters>
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the fallback when stats filters are the default stats filters', () => {
        const { container } = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    stats: {
                        filters: defaultStatsFilters,
                    },
                })}
            >
                <DefaultStatsFilters notReadyFallback={<div>fallback</div>}>
                    <div>Foo bar</div>
                </DefaultStatsFilters>
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should set the default filters on mount', () => {
        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <DefaultStatsFilters />
            </Provider>,
        )

        expect(store.getActions()).toMatchSnapshot()
    })

    it('should set the default period using user timezone ', () => {
        const store = mockStore({
            ...defaultState,
            currentUser: defaultState.currentUser.set(
                'timezone',
                'Europe/Paris',
            ),
        })

        render(
            <Provider store={store}>
                <DefaultStatsFilters />
            </Provider>,
        )

        expect(store.getActions()).toMatchSnapshot()
    })

    it('should reset the filters on unmount', () => {
        const store = mockStore(defaultState)

        const { unmount } = render(
            <Provider store={store}>
                <DefaultStatsFilters>
                    <div>Foo bar</div>
                </DefaultStatsFilters>
            </Provider>,
        )
        unmount()

        expect(persistFiltersMock).toHaveBeenCalledWith(defaultStatsFilters)
        expect(store.getActions()).toMatchSnapshot()
    })

    it('should load the Custom Fields definitions to speed up the Filters load time', () => {
        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <DefaultStatsFilters />
            </Provider>,
        )

        expect(useCustomFieldDefinitionsMock).toHaveBeenCalled()
    })
})
