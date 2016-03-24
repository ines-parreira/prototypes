import * as actions from '../actions/view'
import Immutable, { Map } from 'immutable'
import _ from 'lodash'
import { ASTToGroupedFilters, groupedFiltersToAST, getCode } from '../filters/ast'

/*
*  Utility functions to keep view.filters_ast in-sync with the groupedFilters used on the frontend
*/

function addExtraAttributes(view) {
    let filters_ast = view.get('filters_ast').toJS()
    let filters = getCode(filters_ast)
    let groupedFilters = ASTToGroupedFilters(filters_ast)
    // Map.merge turns JS objects back into Immutable objects
    return view.merge({
        dirty: false,
        filters,
        groupedFilters,
    })
}

function updateViewFilters(view, groupedFilters, updatedFilters) {
    let filters_ast = groupedFiltersToAST(updatedFilters)
    let filters = getCode(filters_ast)
    return view.merge({
        dirty: true,
        filters,
        filters_ast,
        groupedFilters: updatedFilters,
    })
}


export function views(state = Map(), action) {
    let view
    let groupedFilters
    let updatedFilters
    let updatedView

    switch (action.type) {
        case actions.NEW_VIEW:
            return state

        case actions.UPDATE_VIEW:
            view = state.get(action.slug).merge(action.data)
            return state.set(action.slug, view)

        case actions.FETCH_VIEW_LIST_START:
            return state

        case actions.SUBMIT_VIEW_START:
            return state.setIn([action.slug, 'dirty'], false)

        case actions.UPDATE_VIEW_FILTERS:
            view = state.get(action.slug)
            groupedFilters = view.get('groupedFilters').toJS()
            updatedFilters = _.assign({}, groupedFilters, action.newFilters)
            updatedView = updateViewFilters(view, groupedFilters, updatedFilters)
            return state.merge({[action.slug]: updatedView})

        case actions.CLEAR_VIEW_FILTER:
            view = state.get(action.slug)
            groupedFilters = view.get('groupedFilters').toJS()
            updatedFilters = _.omit(groupedFilters, action.name)
            updatedView = updateViewFilters(view, groupedFilters, updatedFilters)
            return state.merge({[action.slug]: updatedView})

        case actions.FETCH_VIEW_LIST_SUCCESS:
            let viewsBySlug = Map()
            for (let view of action.resp.data) {
                view = addExtraAttributes(Immutable.fromJS(view))
                viewsBySlug = viewsBySlug.set(view.get('slug'), view)
            }
            return viewsBySlug

        default:
            return state
    }
}
