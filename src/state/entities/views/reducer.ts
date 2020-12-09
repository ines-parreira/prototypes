import {createReducer} from '@reduxjs/toolkit'

import {View} from '../../../models/view/types'

import {ViewsState} from './types'
import {viewsFetched, viewCreated, viewDeleted, viewUpdated} from './actions'

const initialState: ViewsState = {}

const viewsReducer = createReducer<ViewsState>(initialState, (builder) =>
    builder
        .addCase(viewsFetched, (state, {payload}) => {
            payload.map((view: View) => {
                state[view.id.toString()] = view
            })
        })
        .addCase(viewCreated, (state, {payload}) => {
            state[payload.id.toString()] = payload
        })
        .addCase(viewDeleted, (state, {payload}) => {
            delete state[payload.toString()]
        })
        .addCase(viewUpdated, (state, {payload}) => {
            state[payload.id.toString()] = payload
        })
)

export default viewsReducer
