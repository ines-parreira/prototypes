import * as actions from '../actions/view'
import { OrderedMap, Map } from 'immutable'
import _ from 'lodash'
import { ASTToGroupedFilters, groupedFiltersToAST, getCode } from '../filters/ast'

/*
*  Utility functions to keep view.filters_ast in-sync with the groupedFilters used on the frontend
*/

const viewsInitial = Map({
    items: OrderedMap(),
    viewBeingEdited: Map,
    loading: false,
    active: null
})

function addExtraAttributes(view) {
    const filtersAst = view.filters_ast
    const filters = getCode(filtersAst)
    const groupedFilters = ASTToGroupedFilters(filtersAst)

    return Map(Object.assign({}, view, {
        dirty: false,
        filters,
        filters_ast: Map(filtersAst),
        groupedFilters: Map(groupedFilters)
    }))
}

function updateViewFilters(view, updatedFilters) {
    const filtersAst = groupedFiltersToAST(updatedFilters)
    const filters = getCode(filtersAst)

    return view.merge({
        dirty: true,
        filters,
        filters_ast: Map(filtersAst),
        groupedFilters: Map(updatedFilters)
    })
}


export function views(state = viewsInitial, action) {
    let view
    let groupedFilters
    let updatedFilters
    let updatedView
    let newState = state

    switch (action.type) {
        case actions.NEW_VIEW:
            return state

        case actions.UPDATE_VIEW:
            view = state.getIn(['items', action.slug])
            view = view.set('dirty', true)
            return newState.set('viewBeingEdited', view.merge(action.data)).setIn(['items', action.slug], view)

        case actions.FETCH_VIEW_LIST_START:
            return state.set('loading', true)

        case actions.SUBMIT_VIEW_START:
            view = state.get('viewBeingEdited')

            if (action.data.slug !== action.slug) {
                if (action.data.id) {
                    newState = newState.deleteIn(['items', action.slug])
                } else {
                    newState = newState.setIn(['items', action.slug, 'dirty'], false)
                }

                newState = newState.set('active', action.data.slug)
            }

            newState = newState.setIn(['items', action.data.slug], view.merge({ dirty: false }))
            return newState.set('items', newState.get('items').sort((a, b) => a.get('order') - b.get('order')))

        case actions.UPDATE_VIEW_FILTERS:
            view = state.getIn(['items', action.slug])
            groupedFilters = view.get('groupedFilters').toJS()
            updatedFilters = _.assign({}, groupedFilters, action.newFilters)
            updatedView = updateViewFilters(view, updatedFilters)

            return state.setIn(['items', action.slug], updatedView)

        case actions.CLEAR_VIEW_FILTER:
            view = state.getIn(['items', action.slug])
            groupedFilters = view.get('groupedFilters').toJS()
            updatedFilters = _.omit(groupedFilters, action.name)
            updatedView = updateViewFilters(view, updatedFilters)

            return state.setIn(['items', action.slug], updatedView)

        case actions.FETCH_VIEW_LIST_SUCCESS:
            const viewsBySlug = {}

            for (let curView of action.resp.data) {
                viewsBySlug[curView.slug] = addExtraAttributes(curView)
            }

            return state.merge({
                items: Map(viewsBySlug).sort((a, b) => a.get('order') - b.get('order')),
                loading: false,
            })

        case actions.APPLY_VIEW:
            return state.set('active', action.slug)

        default:
            return state
    }
}
