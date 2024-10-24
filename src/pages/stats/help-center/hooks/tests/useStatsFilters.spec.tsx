import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {useStatsFilters} from 'pages/stats/help-center/hooks/useStatsFilters'
import {mergeStatsFilters} from 'state/stats/statsSlice'
import {RootState} from 'state/types'

const START_DATE = '2021-02-03T00:00:00.000Z'
const END_DATE = '2021-02-03T23:59:59.999Z'
const initialState = {
    helpCenters: [1],
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

describe('useHelpCenterStatsFilters', () => {
    it('should return initial filters', () => {
        renderHook(() => useStatsFilters(initialState), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(mockStore.getActions()).toContainEqual(
            mergeStatsFilters(initialState)
        )
    })

    it('should change filter', () => {
        const {result} = renderHook(() => useStatsFilters(initialState), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        result.current[1]({helpCenters: [2]})

        expect(mockStore.getActions()).toContainEqual(
            mergeStatsFilters({
                helpCenters: [2],
            })
        )
    })
})
