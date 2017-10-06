// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

import type {stateType} from '../types'
import type {Map} from 'immutable'

export const getTagsState = (state: stateType): Map<*,*> => state.tags || fromJS({})

export const getTags = createSelector(
    [getTagsState],
    state => state.get('items') || fromJS([])
)

export const getNumberPages = createSelector(
    [getTagsState],
    state => state.getIn(['_internal', 'pagination', 'nb_pages']) || 1
)

export const getCurrentPage = createSelector(
    [getTagsState],
    state => state.getIn(['_internal', 'pagination', 'page']) || 1
)
