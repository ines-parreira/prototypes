import {PayloadActionCreator} from '@reduxjs/toolkit'

import {Tag} from '../../../models/tag/types'

import {
    TAG_CREATED,
    TAG_DELETED,
    TAG_FETCHED,
    TAG_UPDATED,
    TAGS_FETCHED,
} from './constants'

export type TagsState = {
    [key: string]: Tag
}

export type TagsAction =
    | TagCreatedAction
    | TagDeletedAction
    | TagFetchedAction
    | TagUpdatedAction
    | TagsFetchedAction

export type TagCreatedAction = PayloadActionCreator<Tag, typeof TAG_CREATED>

export type TagDeletedAction = PayloadActionCreator<string, typeof TAG_DELETED>

export type TagFetchedAction = PayloadActionCreator<Tag, typeof TAG_FETCHED>

export type TagUpdatedAction = PayloadActionCreator<Tag, typeof TAG_UPDATED>

export type TagsFetchedAction = PayloadActionCreator<Tag[], typeof TAGS_FETCHED>
