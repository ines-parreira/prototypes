import {createAction} from '@reduxjs/toolkit'

import {Macro} from '../../../models/macro/types'

import {
    MACRO_CREATED,
    MACRO_DELETED,
    MACRO_FETCHED,
    MACRO_UPDATED,
    MACROS_FETCHED,
} from './constants'

export const macroCreated = createAction<Macro>(MACRO_CREATED)

export const macroDeleted = createAction<number>(MACRO_DELETED)

export const macroFetched = createAction<Macro>(MACRO_FETCHED)

export const macroUpdated = createAction<Macro>(MACRO_UPDATED)

export const macrosFetched = createAction<Macro[]>(MACROS_FETCHED)
