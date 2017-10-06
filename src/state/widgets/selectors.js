// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'
import {itemsWithContext} from './utils'

import {getActiveUser} from '../users/selectors'

import type {Map} from 'immutable'
import type {stateType} from '../types'
import type {contextType} from './types'

export const getWidgetsState = (state: stateType): Map<*,*> => state.widgets || fromJS({})

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

export const getWidgetsWithContext = (context: contextType) => createSelector(
    [getWidgets, getContext],
    // take current context by default
    (widgets, currentContext) => itemsWithContext(widgets, context || currentContext)
)

export const hasWidgetsWithContext = (context: contextType) => createSelector(
    [getWidgetsWithContext(context)],
    widgets => !widgets.isEmpty()
)

export const getSources = (state: stateType) => {
    return fromJS({
        ticket: state.ticket,
        user: getActiveUser(state)
    })
}

export const getSourcesWithRequester = createSelector(
    [getSources],
    state => {
        return !state.getIn(['ticket', 'id']) ? state.setIn(['ticket', 'requester'], state.get('user')) : state
    }
)

export const isEditing = createSelector(
    [getWidgetsState],
    state => state.getIn(['_internal', 'isEditing'], false) || false
)
