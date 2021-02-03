import {createAction} from '@reduxjs/toolkit'

import {Tag} from '../../../models/tag/types'

import {
    TAG_CREATED,
    TAG_DELETED,
    TAG_FETCHED,
    TAG_UPDATED,
    TAGS_FETCHED,
} from './constants'

export const tagCreated = createAction<Tag>(TAG_CREATED)

export const tagDeleted = createAction<number>(TAG_DELETED)

export const tagFetched = createAction<Tag>(TAG_FETCHED)

export const tagUpdated = createAction<Tag>(TAG_UPDATED)

export const tagsFetched = createAction<Tag[]>(TAGS_FETCHED)
