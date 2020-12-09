import {createReducer} from '@reduxjs/toolkit'

import {viewsCountFetched} from './actions'
import {ViewsCountState} from './types'

const initialState: ViewsCountState = {}

const viewsCountReducer = createReducer<ViewsCountState>(
    initialState,
    (builder) =>
        builder.addCase(viewsCountFetched, (state, {payload}) => {
            return {...state, ...payload}
        })
)

export default viewsCountReducer
