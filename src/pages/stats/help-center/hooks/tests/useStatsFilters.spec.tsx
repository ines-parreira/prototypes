import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { useHelpCenterStatsFilters } from 'pages/stats/help-center/hooks/useHelpCenterStatsFilters'
import { mergeStatsFiltersWithLogicalOperator } from 'state/stats/statsSlice'
import { RootState } from 'state/types'

describe('useHelpCenterStatsFilters', () => {
    const START_DATE = '2021-02-03T00:00:00.000Z'
    const END_DATE = '2021-02-03T23:59:59.999Z'
    const initialState = {
        helpCenters: withDefaultLogicalOperator([1]),
        period: {
            end_datetime: END_DATE,
            start_datetime: START_DATE,
        },
    }

    const defaultStatsFilters = {
        period: {
            start_datetime: START_DATE,
            end_datetime: END_DATE,
        },
    }

    const defaultState = {
        stats: {
            filters: defaultStatsFilters,
        },
        ui: {
            stats: {
                filters: {
                    cleanStatsFilters: defaultStatsFilters,
                    isFilterDirty: false,
                },
            },
        },
    } as RootState
    const mockStore = configureMockStore([thunk])(defaultState)

    it('should return initial filters', () => {
        renderHook(() => useHelpCenterStatsFilters(initialState), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(mockStore.getActions()).toContainEqual(
            mergeStatsFiltersWithLogicalOperator(initialState),
        )
    })
})
