import { createReducer } from '@reduxjs/toolkit'

import type { HelpCenter } from 'models/helpCenter/types'

import {
    helpCenterCreated,
    helpCenterDeleted,
    helpCenterFetched,
    helpCentersFetched,
    helpCenterUpdated,
} from './actions'
import type { HelpCentersState } from './types'

export const initialState: HelpCentersState = {
    helpCentersById: {},
}

const helpCenterReducer = createReducer<HelpCentersState>(
    initialState,
    (builder) =>
        builder
            .addCase(helpCenterCreated, (state, { payload }) => {
                state.helpCentersById[payload.id.toString()] = payload
            })
            .addCase(helpCenterFetched, (state, { payload }) => {
                state.helpCentersById[payload.id.toString()] = payload
            })
            .addCase(helpCenterUpdated, (state, { payload }) => {
                state.helpCentersById[payload.id.toString()] = state
                    .helpCentersById[payload.id.toString()]
                    ? {
                          ...state.helpCentersById[payload.id.toString()],
                          ...payload,
                      }
                    : payload
            })
            .addCase(helpCenterDeleted, (state, { payload }) => {
                delete state.helpCentersById[payload.toString()]
            })
            .addCase(helpCentersFetched, (state, { payload }) => {
                payload.map((helpCenter: HelpCenter) => {
                    state.helpCentersById[helpCenter.id.toString()] = helpCenter
                })
            }),
)

export default helpCenterReducer
