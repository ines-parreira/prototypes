import {PayloadActionCreator} from '@reduxjs/toolkit'

import {View} from '../../../models/view/types'

import {
    VIEWS_FETCHED,
    VIEW_UPDATED,
    VIEW_DELETED,
    VIEW_CREATED,
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
