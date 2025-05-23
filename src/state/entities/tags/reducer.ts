import { createReducer } from '@reduxjs/toolkit'

import { Tag } from '@gorgias/helpdesk-queries'

import {
    tagCreated,
    tagDeleted,
    tagFetched,
    tagsFetched,
    tagUpdated,
} from './actions'
import { TagsState } from './types'

const initialState: TagsState = {}

const tagsReducer = createReducer<TagsState>(initialState, (builder) =>
    builder
        .addCase(tagCreated, (state, { payload }) => {
            state[payload.id.toString()] = payload
        })
        .addCase(tagDeleted, (state, { payload }) => {
            delete state[payload.toString()]
        })
        .addCase(tagFetched, (state, { payload }) => {
            state[payload.id.toString()] = payload
        })
        .addCase(tagUpdated, (state, { payload }) => {
            state[payload.id.toString()] = payload
        })
        .addCase(tagsFetched, (state, { payload }) => {
            payload.forEach((tag: Tag) => {
                state[tag.id.toString()] = tag
            })
        }),
)

export default tagsReducer
