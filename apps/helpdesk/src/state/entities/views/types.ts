import type { PayloadActionCreator } from '@reduxjs/toolkit'

import type { View } from 'models/view/types'

import type {
    VIEW_CREATED,
    VIEW_DELETED,
    VIEW_UPDATED,
    VIEWS_FETCHED,
} from './constants'

export type ViewsState = {
    [key: string]: View
}

export type ViewsAction =
    | ViewsFetchedAction
    | ViewCreatedAction
    | ViewDeletedAction
    | ViewUpdatedAction

export type ViewsFetchedAction = PayloadActionCreator<
    View[],
    typeof VIEWS_FETCHED
>

export type ViewCreatedAction = PayloadActionCreator<View, typeof VIEW_CREATED>

export type ViewDeletedAction = PayloadActionCreator<
    number,
    typeof VIEW_DELETED
>

export type ViewUpdatedAction = PayloadActionCreator<View, typeof VIEW_UPDATED>
