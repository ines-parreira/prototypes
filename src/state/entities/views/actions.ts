import {createAction} from '@reduxjs/toolkit'

import {View} from '../../../models/view/types'

import {
    VIEWS_FETCHED,
    VIEW_CREATED,
    VIEW_DELETED,
    VIEW_UPDATED,
} from './constants'

export const viewsFetched = createAction<View[]>(VIEWS_FETCHED)

export const viewCreated = createAction<View>(VIEW_CREATED)

export const viewDeleted = createAction<number>(VIEW_DELETED)

export const viewUpdated = createAction<View>(VIEW_UPDATED)
