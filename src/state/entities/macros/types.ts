import type {PayloadActionCreator} from '@reduxjs/toolkit'

import type {Macro} from '../../../models/macro/types'

import {
    MACRO_CREATED,
    MACRO_DELETED,
    MACRO_FETCHED,
    MACRO_UPDATED,
    MACROS_FETCHED,
} from './constants.js'

export type MacrosState = {
    [key: string]: Macro
}

export type MacrosAction =
    | MacroCreatedAction
    | MacroDeletedAction
    | MacroFetchedAction
    | MacroUpdatedAction
    | MacrosFetchedAction

export type MacroCreatedAction = PayloadActionCreator<
    Macro,
    typeof MACRO_CREATED
>

export type MacroDeletedAction = PayloadActionCreator<
    string,
    typeof MACRO_DELETED
>

export type MacroFetchedAction = PayloadActionCreator<
    Macro,
    typeof MACRO_FETCHED
>

export type MacroUpdatedAction = PayloadActionCreator<
    Macro,
    typeof MACRO_UPDATED
>

export type MacrosFetchedAction = PayloadActionCreator<
    Macro[],
    typeof MACROS_FETCHED
>
