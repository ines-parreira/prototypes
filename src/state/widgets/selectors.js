// @flow
import {fromJS, Map} from 'immutable'
import {createSelector} from 'reselect'

import {getActiveCustomer} from '../customers/selectors'

import type {stateType} from '../types'

import {itemsWithContext} from './utils'
import type {contextType} from './types'


export const getWidgetsState = (state: stateType): Map<*,*> => state.widgets || fromJS({})

export const getContext = createSelector(
    [getWidgetsState],
    (state) => state.get('currentContext') || ''
)

export const getWidgets = createSelector(
    [getWidgetsState],
    (state) => state.get('items') || fromJS([])
)

export const hasWidgets = createSelector(
    [getWidgets],
    (widgets) => !widgets.isEmpty()
)

export const getWidgetsWithContext = (context: contextType) => createSelector(
    [getWidgets, getContext],
    // take current context by default
    (widgets, currentContext) => itemsWithContext(widgets, context || currentContext)
)

export const hasWidgetsWithContext = (context: contextType) => createSelector(
    [getWidgetsWithContext(context)],
    (widgets) => !widgets.isEmpty()
)

export const getSources = (state: stateType) => {
    return fromJS({
        ticket: state.ticket,
        customer: getActiveCustomer(state)
    })
}

export const getSourcesWithCustomer = createSelector(
    [getSources],
    (sources) => {
        // If there's no customer and ticket is not loading then use the one from sources.
        // Loading check prevents from content flashing: https://github.com/gorgias/gorgias/issues/2415
        if (!sources.getIn(['ticket', 'customer']) &&
            !sources.getIn(['ticket', '_internal', 'loading', 'fetchTicket'])) {
            return sources.setIn(['ticket', 'customer'], sources.get('customer'))
        }
        return sources
    }
)

export const isEditing = createSelector(
    [getWidgetsState],
    (state) => state.getIn(['_internal', 'isEditing']) || false
)
