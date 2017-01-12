import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

export const getViewsState = state => state.views || fromJS({})

export const getViews = createSelector(
    [getViewsState],
    state => state.get('items', fromJS([]))
)

export const getActiveView = createSelector(
    [getViewsState],
    state => state.get('active') || fromJS({})
)

export const getActiveViewSearch = createSelector(
    [getActiveView],
    state => state.get('search') || fromJS({})
)

export const getActiveViewFilters = createSelector(
    [getActiveView],
    state => state.get('filters') || ''
)
