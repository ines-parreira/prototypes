import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { createSelector } from 'reselect'

import type { RootState } from '../types'
import type { TagsState } from './types'

export const getTagsState = (state: RootState): TagsState =>
    state.tags || fromJS({})

export const getTags = createSelector(
    getTagsState,
    (state) => (state.get('items') || fromJS([])) as List<Map<any, any>>,
)

export const getInternal = createSelector(
    getTagsState,
    (state) => (state.get('_internal') || fromJS({})) as Map<any, any>,
)

export const getSelectAll = createSelector(
    getInternal,
    (state) => (state.get('selectAll') as boolean) || false,
)

export const getIsCreating = createSelector(
    getInternal,
    (state) => !!state.get('creating'),
)

export const getMeta = createSelector(
    getTagsState,
    (state) => (state.get('meta') || fromJS({})) as Map<any, any>,
)

export const getSelectedTagMeta = (tagId: number) =>
    createSelector(
        getMeta,
        (state) => (state.get(tagId) || fromJS({})) as Map<any, any>,
    )

export const makeGetSelectedTagMeta = (state: RootState) => (tagId: number) =>
    getSelectedTagMeta(tagId)(state)
