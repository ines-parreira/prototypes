import {createReducer} from '@reduxjs/toolkit'

import {statFetched} from './actions'
import {StatsState} from './types'

const initialState: StatsState = {}

const sectionsReducer = createReducer<StatsState>(initialState, (builder) =>
    builder.addCase(
        statFetched,
        (state, {payload: {statName, resourceName, value}}) => {
            state[`${statName}/${resourceName}`] = value
        }
    )
)

export default sectionsReducer
