import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

export const getTagsState = state => state.tags || fromJS({})

export const getTags = createSelector(
    [getTagsState],
    state => state.get('items', fromJS([]))
)
