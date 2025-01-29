import {waitFor} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'

import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {useTables} from 'hooks/reporting/common/useTableReportData'

import {ReportingGranularity} from 'models/reporting/types'
import {StatsFiltersWithLogicalOperator} from 'models/stat/types'

import {RootState, StoreDispatch} from 'state/types'
import {
    initialState,
    ticketInsightsSlice,
} from 'state/ui/stats/ticketInsightsSlice'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('useTable hooks', () => {
    const defaultStatsFilters: StatsFiltersWithLogicalOperator = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
    }
    const defaultState = {
        ui: {
            stats: {
                [ticketInsightsSlice.name]: {
                    ...initialState,
                    selectedCustomField: {
                        id: 123,
                        label: 'someLabel',
                        isLoading: false,
                    },
                },
            },
        },
    } as RootState
    const granularity = ReportingGranularity.Day
    const userTimezone = 'UTC'
    const fileName = 'someFileName'

    describe('useTables', () => {
        const tableResponse = {isLoading: false, fileName, files: {}}
        const tableSources = [
            {
                title: 'someTitle',
                fetchTable: () => Promise.resolve(tableResponse),
            },
        ]

        beforeEach(() => {})

        it('should fetch Table Reports', async () => {
            const {result} = renderHook(
                () =>
                    useTables(
                        defaultStatsFilters,
                        userTimezone,
                        granularity,
                        tableSources
                    ),
                {
                    wrapper: ({children}) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                }
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    files: {},
                    isFetching: false,
                })
            })
        })

        it('should return empty on error', async () => {
            const state = {
                ui: {
                    stats: {
                        [ticketInsightsSlice.name]: initialState,
                    },
                },
            } as RootState
            const errorTableSources = [
                {
                    title: 'someTitle',
                    fetchTable: () => Promise.reject({}),
                },
            ]

            const {result} = renderHook(
                () =>
                    useTables(
                        defaultStatsFilters,
                        userTimezone,
                        granularity,
                        errorTableSources
                    ),
                {
                    wrapper: ({children}) => (
                        <Provider store={mockStore(state)}>{children}</Provider>
                    ),
                }
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    files: {},
                    isFetching: false,
                })
            })
        })
    })
})
