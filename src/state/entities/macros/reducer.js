//@flow
import {createReducer} from '@reduxjs/toolkit'

import type {Macro} from '../../../models/macro'

import type {
    MacrosState,
    MacroCreatedAction,
    MacroDeletedAction,
    MacroFetchedAction,
    MacroUpdatedAction,
    MacrosFetchedAction,
} from './types'
import {
    macroCreated,
    macroDeleted,
    macroFetched,
    macroUpdated,
    macrosFetched,
} from './actions'

const initialState: MacrosState = {}

const macrosReducer = createReducer<MacrosState>(initialState, {
    [macroCreated.type]: (
        state: MacrosState,
        {payload}: MacroCreatedAction
    ) => {
        state[payload.id.toString()] = payload
    },
    [macroDeleted.type]: (
        state: MacrosState,
        {payload}: MacroDeletedAction
    ) => {
        delete state[payload.toString()]
    },
    [macroFetched.type]: (
        state: MacrosState,
        {payload}: MacroFetchedAction
    ) => {
        state[payload.id.toString()] = payload
    },
    [macroUpdated.type]: (
        state: MacrosState,
        {payload}: MacroUpdatedAction
    ) => {
        state[payload.id.toString()] = payload
    },
    [macrosFetched.type]: (
        state: MacrosState,
        {payload}: MacrosFetchedAction
    ) => {
        payload.map((macro: Macro) => {
            state[macro.id.toString()] = macro
        })
    },
})

export default macrosReducer
