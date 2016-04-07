import * as actions from '../actions/view'
import { Map } from 'immutable'
import _ from 'lodash'
import { ASTToGroupedFilters, groupedFiltersToAST, getCode } from '../filters/ast'

/*
*  Utility functions to keep view.filters_ast in-sync with the groupedFilters used on the frontend
*/

const viewsInitial = Map({
    items: Map(),
    loading: false
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

    switch (action.type) {
        case actions.NEW_VIEW:
            return state

        case actions.UPDATE_VIEW:
            view = state.getIn(['items', action.slug])
            const newView = state.setIn(['items', action.slug], view.merge(action.data))
            console.log(newView.toJS())
            return newView

        case actions.FETCH_VIEW_LIST_START:
            return state.set('loading', true)

        case actions.SUBMIT_VIEW_START:
            return state.setIn(['items', action.slug, 'dirty'], false)

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

            return Map({
                items: Map(viewsBySlug),
                loading: false
            })

        default:
            return state
    }
}
