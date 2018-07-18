// @flow
import {fromJS, Map} from 'immutable'
import {createSelector} from 'reselect'
import {itemsWithContext} from './utils'

import {getActiveCustomer} from '../customers/selectors'

import type {stateType} from '../types'
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
    (state) => {
        return !state.getIn(['ticket', 'customer']) ? state.setIn(['ticket', 'customer'], state.get('customer')) : state
    }
)

export const isEditing = createSelector(
    [getWidgetsState],
    (state) => state.getIn(['_internal', 'isEditing']) || false
)
