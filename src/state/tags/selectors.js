// @flow
import {fromJS, Map} from 'immutable'
import {createSelector} from 'reselect'

import type {stateType} from '../types'

export const getTagsState = (state: stateType): Map<*, *> =>
    state.tags || fromJS({})

export const getTags = createSelector(
    [getTagsState],
    (state) => state.get('items') || fromJS([])
)

export const getInternal = createSelector(
    [getTagsState],
    (state) => state.get('_internal') || fromJS({})
)

export const getNumberPages = createSelector(
    [getInternal],
    (state) => state.getIn(['pagination', 'nb_pages']) || 1
)

export const getCurrentPage = createSelector(
    [getInternal],
    (state) => state.getIn(['pagination', 'page']) || 1
)

export const getSelectAll = createSelector(
    [getInternal],
    (state) => state.get('selectAll') || false
)

export const getMeta = createSelector(
    [getTagsState],
    (state) => state.get('meta') || fromJS({})
)

export const getSelectedTagMeta = (tagId: number) =>
    createSelector([getMeta], (state) => state.get(tagId) || fromJS({}))

export const makeGetSelectedTagMeta = (state: stateType) => (tagId: number) =>
    getSelectedTagMeta(tagId)(state)
