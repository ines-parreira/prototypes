
//@flow
import {createAction} from '@reduxjs/toolkit'

import type {Macro} from '../../../models/macro'

import {MACRO_CREATED, MACRO_DELETED, MACRO_FETCHED, MACRO_UPDATED, MACROS_FETCHED} from './constants'

export const macroCreated = createAction<typeof MACRO_CREATED, Macro>(
    MACRO_CREATED
)

export const macroDeleted = createAction<typeof MACRO_DELETED, string>(
    MACRO_DELETED
)

export const macroFetched = createAction<typeof MACRO_FETCHED, Macro>(
    MACRO_FETCHED
)

export const macroUpdated = createAction<typeof MACRO_UPDATED, Macro>(
    MACRO_UPDATED
)

export const macrosFetched = createAction<typeof MACROS_FETCHED, Macro[]>(
    MACROS_FETCHED
)
