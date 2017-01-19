import {fromJS} from 'immutable'
import {createSelector} from 'reselect'
import {itemsWithContext} from './utils'

import {getActiveUser} from '../users/selectors'

export const getWidgetsState = state => state.widgets || fromJS({})

export const getContext = createSelector(
    [getWidgetsState],
    state => state.get('currentContext', '')
)

export const getWidgets = createSelector(
    [getWidgetsState],
    state => state.get('items', fromJS([]))
)

export const hasWidgets = createSelector(
    [getWidgets],
    widgets => !widgets.isEmpty()
)

export const getWidgetsWithContext = context => createSelector(
    [getWidgets, getContext],
    // take current context by default
    (widgets, currentContext) => itemsWithContext(widgets, context || currentContext)
)

export const hasWidgetsWithContext = context => createSelector(
    [getWidgetsWithContext(context)],
    widgets => !widgets.isEmpty()
)

export const getSources = state => {
    return fromJS({
        ticket: state.ticket,
        user: getActiveUser(state)
    })
}

export const isEditing = createSelector(
    [getWidgetsState],
    state => state.getIn(['_internal', 'isEditing'], false) || false
)
