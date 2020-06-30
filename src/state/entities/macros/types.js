//@flow
import type {ActionCreatedBy} from '@reduxjs/toolkit'

import type {Macro} from '../../../models/macro'

import {
    macroCreated,
    macroDeleted,
    macroFetched,
    macroUpdated,
    macrosFetched,
} from './actions'

export type MacrosState = {
    [string]: Macro,
}

export type MacrosAction =
    | MacroCreatedAction
    | MacroDeletedAction
    | MacroFetchedAction
    | MacroUpdatedAction
    | MacrosFetchedAction

export type MacroCreatedAction = ActionCreatedBy<typeof macroCreated>

export type MacroDeletedAction = ActionCreatedBy<typeof macroDeleted>

export type MacroFetchedAction = ActionCreatedBy<typeof macroFetched>

export type MacroUpdatedAction = ActionCreatedBy<typeof macroUpdated>

export type MacrosFetchedAction = ActionCreatedBy<typeof macrosFetched>
