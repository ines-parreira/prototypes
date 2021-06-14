import {createReducer} from '@reduxjs/toolkit'

import {fetchStatEnded, fetchStatStarted} from './actions'
import {StatsState} from './types'

export const initialState = {
    fetchingMap: {},
}

const statsReducer = createReducer<StatsState>(initialState, (builder) =>
    builder
        .addCase(
            fetchStatEnded,
            (state, {payload: {statName, resourceName}}) => {
                state.fetchingMap[`${statName}/${resourceName}`] = false
            }
        )
        .addCase(
            fetchStatStarted,
            (state, {payload: {statName, resourceName}}) => {
                state.fetchingMap[`${statName}/${resourceName}`] = true
            }
        )
)

export default statsReducer
