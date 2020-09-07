import {fromJS, Map, List} from 'immutable'
import {createSelector} from 'reselect'

import {getActiveCustomer} from '../customers/selectors'

import {RootState} from '../types'

import {itemsWithContext} from './utils'
import {WidgetContextType, WidgetsState} from './types'

export const getWidgetsState = (state: RootState): WidgetsState =>
    state.widgets || fromJS({})

export const getContext = createSelector<RootState, string, WidgetsState>(
    getWidgetsState,
    (state) => (state.get('currentContext') as string) || ''
)

export const getWidgets = createSelector<RootState, List<any>, WidgetsState>(
    getWidgetsState,
    (state) => (state.get('items') || fromJS([])) as List<any>
)

export const hasWidgets = createSelector<RootState, boolean, List<any>>(
    getWidgets,
    (widgets) => !widgets.isEmpty()
)

export const getWidgetsWithContext = (context: WidgetContextType) =>
    createSelector<RootState, List<any>, List<any>, string>(
        getWidgets,
        getContext,
        // take current context by default
        (widgets, currentContext) =>
            itemsWithContext(widgets, context || currentContext)
    )

export const hasWidgetsWithContext = (context: WidgetContextType) =>
    createSelector<RootState, boolean, List<any>>(
        getWidgetsWithContext(context),
        (widgets) => !widgets.isEmpty()
    )

export const getSources = (state: RootState) => {
    return fromJS({
        ticket: state.ticket,
        customer: getActiveCustomer(state),
    }) as Map<any, any>
}

export const getSourcesWithCustomer = createSelector<
    RootState,
    Map<any, any>,
    Map<any, any>
>(getSources, (sources) => {
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

export const isEditing = createSelector<RootState, boolean, WidgetsState>(
    getWidgetsState,
    (state) => (state.getIn(['_internal', 'isEditing']) as boolean) || false
)
