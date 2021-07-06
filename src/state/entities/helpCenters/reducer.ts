import {createReducer} from '@reduxjs/toolkit'

import {HelpCenter} from '../../../models/helpCenter/types'

import {HelpCentersState} from './types'
import {
    helpCenterCreated,
    helpCenterDeleted,
    helpCenterUpdated,
    helpCentersFetched,
    helpCenterFetched,
} from './actions'

const initialState: HelpCentersState = {}

const helpCenterReducer = createReducer<HelpCentersState>(
    initialState,
    (builder) =>
        builder
            .addCase(helpCenterCreated, (state, {payload}) => {
                state[payload.id.toString()] = payload
            })
            .addCase(helpCenterFetched, (state, {payload}) => {
                state[payload.id.toString()] = payload
            })
            .addCase(helpCenterUpdated, (state, {payload}) => {
                state[payload.id.toString()] = payload
            })
            .addCase(helpCenterDeleted, (state, {payload}) => {
                delete state[payload.toString()]
            })
            .addCase(helpCentersFetched, (state, {payload}) => {
                payload.map((helpCenterArticle: HelpCenter) => {
                    state[helpCenterArticle.id.toString()] = helpCenterArticle
                })
            })
)

export default helpCenterReducer
