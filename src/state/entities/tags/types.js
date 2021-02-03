//@flow
import type {ActionCreatedBy} from '@reduxjs/toolkit'

import type {Tag} from '../../../models/tag'

import {
    tagCreated,
    tagDeleted,
    tagFetched,
    tagUpdated,
    tagsFetched,
} from './actions.ts'

export type TagsState = {
    [string]: Tag,
}

export type TagsAction =
    | TagCreatedAction
    | TagDeletedAction
    | TagFetchedAction
    | TagUpdatedAction
    | TagsFetchedAction

export type TagCreatedAction = ActionCreatedBy<typeof tagCreated>

export type TagDeletedAction = ActionCreatedBy<typeof tagDeleted>

export type TagFetchedAction = ActionCreatedBy<typeof tagFetched>

export type TagUpdatedAction = ActionCreatedBy<typeof tagUpdated>

export type TagsFetchedAction = ActionCreatedBy<typeof tagsFetched>
