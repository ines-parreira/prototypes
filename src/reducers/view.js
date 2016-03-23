import * as actions from '../actions/view'
import Immutable, { Map } from 'immutable'
import _ from 'lodash'
import { ASTToGroupedFilters, groupedFiltersToAST, getCode } from '../filters/ast'

/*
*  Utility functions to keep view.filters_ast in-sync with the groupedFilters used on the frontend
*/

function addAttributes(view) {
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

function updateViewFilters(view, groupedFilters) {
    groupedFilters = groupedFilters.toJS()
    let dirty = !_.isEqual(view.get('groupedFilters').toJS(), groupedFilters)
    let filters_ast = groupedFiltersToAST(groupedFilters)
    let filters = getCode(filters_ast)
    return view.merge({
        dirty,
        filters,
        filters_ast,
        groupedFilters,
    })
}


export function views(state = Map(), action) {
    switch (action.type) {
        case actions.NEW_VIEW:
            return state

        case actions.UPDATE_VIEW:
            return state.mergeDeep({[action.slug]: action.data})

        case actions.FETCH_VIEW_LIST_START:
            return state

        case actions.UPDATE_VIEW_FILTERS:
            const updatedView = updateViewFilters(state.get(action.slug))
            return state.mergeDeep({[action.slug]: updatedView})

        case actions.FETCH_VIEW_LIST_SUCCESS:
            let viewsBySlug = Map()
            for (let view of action.resp.data) {
                view = addAttributes(Immutable.fromJS(view))
                viewsBySlug = viewsBySlug.set(view.get('slug'), view)
            }
            return viewsBySlug

        default:
            return state
    }
}
