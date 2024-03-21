import {fromJS, Map, List} from 'immutable'
import {createSelector} from 'reselect'

import {RootState} from 'state/types'
import {DEPRECATED_getActiveCustomer} from 'state/customers/selectors'
import {getTicketState} from 'state/ticket/selectors'

import {itemsWithContext} from './utils'
import {WidgetEnvironment, WidgetsState} from './types'

export const getWidgetsState = (state: RootState): WidgetsState =>
    state.widgets || fromJS({})

export const getContext = createSelector(
    getWidgetsState,
    (state) => (state.get('currentContext') as WidgetEnvironment) || ''
)

export const getWidgets = createSelector(
    getWidgetsState,
    (state) => (state.get('items') || fromJS([])) as List<any>
)

export const hasWidgets = createSelector(
    getWidgets,
    (widgets) => !widgets.isEmpty()
)

export const getWidgetsWithContext = (context?: WidgetEnvironment) =>
    createSelector(
        getWidgets,
        getContext,
        // take current context by default
        (widgets, currentContext) =>
            itemsWithContext(widgets, context || currentContext)
    )

export const hasWidgetsWithContext = (context?: WidgetEnvironment) =>
    createSelector(
        getWidgetsWithContext(context),
        (widgets) => !widgets.isEmpty()
    )

export const getSources = createSelector(
    getTicketState,
    DEPRECATED_getActiveCustomer,
    (ticket, customer) => {
        return fromJS({
            ticket,
            customer,
        }) as Map<any, any>
    }
)

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
