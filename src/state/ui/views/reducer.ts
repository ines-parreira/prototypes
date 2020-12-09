import {createReducer} from '@reduxjs/toolkit'

import {activeViewIdSet} from './actions'
import {ViewsState} from './types'

const initialState: ViewsState = {
    activeViewId: null,
}

const ViewsReducer = createReducer<ViewsState>(initialState, (builder) =>
    builder.addCase(activeViewIdSet, (state, {payload}) => {
        state.activeViewId = payload
    })
)

export default ViewsReducer
