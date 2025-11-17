import { createReducer } from '@reduxjs/toolkit'

import type { View } from '../../../models/view/types'
import { viewCreated, viewDeleted, viewsFetched, viewUpdated } from './actions'
import type { ViewsState } from './types'

const initialState: ViewsState = {}

const viewsReducer = createReducer<ViewsState>(initialState, (builder) =>
    builder
        .addCase(viewsFetched, (state, { payload }) => {
            payload.map((view: View) => {
                state[view.id.toString()] = view
            })
        })
        .addCase(viewCreated, (state, { payload }) => {
            state[payload.id.toString()] = payload
        })
        .addCase(viewDeleted, (state, { payload }) => {
            delete state[payload.toString()]
        })
        .addCase(viewUpdated, (state, { payload }) => {
            state[payload.id.toString()] = payload
        }),
)

export default viewsReducer
