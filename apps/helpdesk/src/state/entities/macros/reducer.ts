import { createReducer } from '@reduxjs/toolkit'

import type { Macro } from '@gorgias/helpdesk-queries'

import {
    macroCreated,
    macroDeleted,
    macroFetched,
    macrosFetched,
    macroUpdated,
} from './actions'
import type { MacrosState } from './types'

const initialState: MacrosState = {}

const macrosReducer = createReducer<MacrosState>(initialState, (builder) =>
    builder
        .addCase(macroCreated, (state, { payload }) => {
            state[payload.id!.toString()] = payload
        })
        .addCase(macroDeleted, (state, { payload }) => {
            delete state[payload.toString()]
        })
        .addCase(macroFetched, (state, { payload }) => {
            state[payload.id!.toString()] = payload
        })
        .addCase(macroUpdated, (state, { payload }) => {
            state[payload.id!.toString()] = payload
        })
        .addCase(macrosFetched, (state, { payload }) => {
            payload.map((macro: Macro) => {
                state[macro.id!.toString()] = macro
            })
        }),
)

export default macrosReducer
