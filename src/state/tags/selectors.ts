import {fromJS, Map, List} from 'immutable'
import {createSelector} from 'reselect'

import {RootState} from '../types'

import {TagsState} from './types'

export const getTagsState = (state: RootState): TagsState =>
    state.tags || fromJS({})

export const getTags = createSelector<RootState, List<any>, TagsState>(
    getTagsState,
    (state) => (state.get('items') || fromJS([])) as List<any>
)

export const getInternal = createSelector<RootState, Map<any, any>, TagsState>(
    getTagsState,
    (state) => (state.get('_internal') || fromJS({})) as Map<any, any>
)

export const getNumberPages = createSelector<RootState, number, Map<any, any>>(
    getInternal,
    (state) => (state.getIn(['pagination', 'nb_pages']) as number) || 1
)

export const getCurrentPage = createSelector<RootState, number, Map<any, any>>(
    getInternal,
    (state) => (state.getIn(['pagination', 'page']) as number) || 1
)

export const getSelectAll = createSelector<RootState, boolean, Map<any, any>>(
    getInternal,
    (state) => (state.get('selectAll') as boolean) || false
)

export const getMeta = createSelector<RootState, Map<any, any>, TagsState>(
    getTagsState,
    (state) => (state.get('meta') || fromJS({})) as Map<any, any>
)

export const getSelectedTagMeta = (tagId: number) =>
    createSelector<RootState, Map<any, any>, Map<any, any>>(
        getMeta,
        (state) => (state.get(tagId) || fromJS({})) as Map<any, any>
    )

export const makeGetSelectedTagMeta = (state: RootState) => (tagId: number) =>
    getSelectedTagMeta(tagId)(state)
