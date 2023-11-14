import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {RootState} from 'state/types'
import {mergeStatsFilters} from 'state/stats/actions'
import {MERGE_STATS_FILTERS} from 'state/stats/constants'
import {useStatsFilters} from '../useStatsFilters'

jest.mock('state/stats/actions', () => ({
    mergeStatsFilters: jest.fn(),
}))
const mockMergeStatsFilters = jest.mocked(mergeStatsFilters)

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
    stats: fromJS({
        filters: defaultStatsFilters,
    }),
    ui: {
        stats: defaultStatsFilters,
    },
} as unknown as RootState

const mockStore = configureMockStore([thunk])(defaultState)

describe('useHelpCenterStatsFilters', () => {
    beforeEach(() => {
        mockMergeStatsFilters.mockReturnValue({
            type: MERGE_STATS_FILTERS,
            filters: {},
        })
    })
    it('should return initial filters', () => {
        renderHook(() => useStatsFilters(initialState), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(mockMergeStatsFilters).toHaveBeenCalledWith(initialState)
    })

    it('should change filter', () => {
        const {result} = renderHook(() => useStatsFilters(initialState), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        result.current[1]({helpCenters: [2]})

        expect(mockMergeStatsFilters).toHaveBeenLastCalledWith({
            helpCenters: [2],
        })
    })
})
