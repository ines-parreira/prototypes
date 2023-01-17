import {fromJS, Map, List} from 'immutable'
import {createSelector} from 'reselect'

import {DEPRECATED_getActiveCustomer} from '../customers/selectors'

import {RootState} from '../types'

import {itemsWithContext} from './utils'
import {WidgetContextType, WidgetsState} from './types'

export const getWidgetsState = (state: RootState): WidgetsState =>
    state.widgets || fromJS({})

export const getContext = createSelector(
    getWidgetsState,
    (state) => (state.get('currentContext') as WidgetContextType) || ''
)

export const getWidgets = createSelector(
    getWidgetsState,
    (state) => (state.get('items') || fromJS([])) as List<any>
)

export const hasWidgets = createSelector(
    getWidgets,
    (widgets) => !widgets.isEmpty()
)

export const getWidgetsWithContext = (context?: WidgetContextType) =>
    createSelector(
        getWidgets,
        getContext,
        // take current context by default
        (widgets, currentContext) =>
            itemsWithContext(widgets, context || currentContext)
    )

export const hasWidgetsWithContext = (context?: WidgetContextType) =>
    createSelector(
        getWidgetsWithContext(context),
        (widgets) => !widgets.isEmpty()
    )

export const getSources = (state: RootState) => {
    return fromJS({
        ticket: state.ticket,
        customer: DEPRECATED_getActiveCustomer(state),
    }) as Map<any, any>
}

export const getSourcesWithCustomer = createSelector(getSources, (sources) => {
    // If there's no customer and ticket is not loading then use the one from sources.
    // Loading check prevents from content flashing: https://github.com/gorgias/gorgias/issues/2415
    if (
        !sources.getIn(['ticket', 'customer']) &&
        !sources.getIn(['ticket', '_internal', 'loading', 'fetchTicket'])
    ) {
        return sources.setIn(['ticket', 'customer'], sources.get('customer'))
    }
    return sources
})

export const isEditing = createSelector(
    getWidgetsState,
    (state) => (state.getIn(['_internal', 'isEditing']) as boolean) || false
)
