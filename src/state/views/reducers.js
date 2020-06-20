// @flow
import {fromJS, type Map} from 'immutable'
import moment from 'moment'
import _isNumber from 'lodash/isNumber'

import {getCode} from '../../utils'
import type {actionType} from '../types'
import {MAX_RECENT_VIEWS} from '../../config/views'

import * as constants from './constants'
import {
    addFilterAST,
    removeFilterAST,
    recentViewsStorage,
    updateFilterOperator,
    updateFilterValue
} from './utils'
import * as selectors from './selectors'
import {addViewIfMissing} from './utils'

export const initialState = fromJS({
    items: [],
    counts: {},
    active: {},
    recent: {},
    loading: false,
    _internal: {
        lastViewId: null,
        selectedItemsIds: [],
        navigation: {},
        loading: {
            fetchList: false,
            fetchListDiscreet: false,
        }
    }
})

export default function reducer(state: Map<*,*> = initialState, action: actionType): Map<*,*> {
    let items
    let ast = ''
    let code = ''
    let activeView = state.get('active', fromJS({}))

    switch (action.type) {
        case constants.ADD_RECENT_VIEW: {
            if (!action.viewId) {
                return state
            }

            // update recent views
            const newState = state.update('recent', (views) => {
                const now = moment.utc().toISOString()
                // merge the new view and keep the most recent ones
                return views
                    .mergeDeep(fromJS({
                        [action.viewId]: {
                            inserted_datetime: now,
                            updated_datetime: now
                        }
                    }))
                    .sortBy((view) => view.get('insert_datetime'))
                    .slice(-MAX_RECENT_VIEWS)
            })

            // store recent view on the client
            const recentViews = selectors.getRecentViews({views: newState})
            const viewIds = recentViews.keySeq().map((viewId) => parseInt(viewId)).toJS()
            recentViewsStorage.set(viewIds)

            return newState

        }

        case constants.UPDATE_RECENT_VIEWS: {
            // update datetime of given recent views
            return state.update('recent', (views) => {
                return views.map((view, viewId) => {
                    if (action.viewIds.includes(parseInt(viewId))) {
                        return view.set('updated_datetime', moment.utc().toISOString())
                    }
                    return view
                })
            })
        }

        case constants.SET_VIEW_ACTIVE: {
            if (action.view) {
                return state.set('active', action.view)
            }
            return state
        }

        case constants.UPDATE_VIEW: {
            const view = action.view || activeView
            return state.set('active', view.set('dirty', true).set('editMode', action.edit))
        }

        case constants.ACTIVATE_VIEW_EDIT_MODE: {
            const view = action.view || activeView
            return state.set('active', view.set('editMode', true))
        }

        case constants.SET_FIELD_VISIBILITY: {
            const visibleFields = activeView.get('fields', fromJS([]))

            const fields = action.state
                ? visibleFields.push(action.name)
                : visibleFields.delete(visibleFields.indexOf(action.name))

            activeView = activeView.set('fields', fields)

            return state.set('active', activeView)
        }

        case constants.SET_ORDER_DIRECTION: {
            return state.set('active', activeView.merge({
                order_by: action.fieldPath,
                order_dir: action.direction,
            }))
        }

        case constants.ADD_VIEW_FIELD_FILTER: {
            // given a filter and our code+ast => generate new code/ast and save it to the state
            ast = addFilterAST(activeView, action.filter)
            code = getCode(ast.toJS())
            activeView = activeView.set('filters_ast', ast).set('filters', code)

            // enter edit mode
            activeView = activeView.set('editMode', true)

            return state.set('active', activeView.set('dirty', true))
        }

        case constants.REMOVE_VIEW_FIELD_FILTER: {
            ast = removeFilterAST(activeView, action.index)
            if (ast) {
                code = getCode(ast.toJS())
            }
            activeView = activeView.set('filters_ast', ast).set('filters', code)
            return state.set('active', activeView.set('dirty', true))
        }

        case constants.UPDATE_VIEW_FIELD_FILTER: {
            let ast = activeView.get('filters_ast')
            ast = updateFilterValue(ast, action.index, action.value)
            code = getCode(ast.toJS())
            activeView = activeView.set('filters_ast', ast).set('filters', code)
            return state.set('active', activeView.set('dirty', true))
        }

        case constants.UPDATE_VIEW_FIELD_FILTER_OPERATOR: {
            let ast = activeView.get('filters_ast')
            ast = updateFilterOperator(ast, action.index, action.operator)
            code = getCode(ast.toJS())
            activeView = activeView.set('filters_ast', ast).set('filters', code)
            return state.set('active', activeView.set('dirty', true))
        }

        case constants.RESET_VIEW: {
            // find the original view from the state and replace the active view
            let original = selectors.getView(activeView.get('id'), action.configName)({views: state})

            // if it's a new view, it's ID should be 0
            const isUpdate = original.get('id') !== 0

            if (isUpdate) {
                // if is updating an existing view, on reset we close edition panel
                original = original.set('dirty', false).set('editMode', false)
            } else {
                // if creating a new view, on reset we keep the edition panel open
                original = original.set('dirty', true).set('editMode', true)
            }

            return state.set('active', original)
        }

        case constants.SUBMIT_NEW_VIEW_SUCCESS: {
            return state.merge({
                items: addViewIfMissing(state.get('items'), action.resp),
                active: fromJS(action.resp).set('dirty', false)
            })
        }

        case constants.FETCH_VIEW_LIST_START: {
            return state.set('loading', true)
        }

        case constants.FETCH_VIEW_LIST_SUCCESS: {
            items = fromJS(action.resp.data)

            // also populate the active view state
            if (action.currentViewId) {
                activeView = items.find((item) => item.get('id') === parseInt(action.currentViewId), null, fromJS({}))
            }

            return state.merge({
                items,
                active: activeView,
                loading: false
            })
        }

        case constants.CREATE_VIEW_SUCCESS: {
            return state.update('items', (items) => addViewIfMissing(items, action.resp))
        }

        case constants.UPDATE_VIEW_SUCCESS: {
            let newState = state.update('items', (items) => items.map((view) => {
                if (view.get('id') === action.resp.id) {
                    return fromJS(action.resp)
                }
                return view
            }))
            // also update the active view if we're on it
            if (newState.getIn(['active', 'id']) === action.resp.id) {
                newState = newState.set('active', fromJS(action.resp))
            }
            return newState
        }

        case constants.DELETE_VIEW_SUCCESS: {
            return state.merge({
                items: state.get('items').filter((item) => item.get('id') !== action.viewId),
            })
        }

        case constants.FETCH_LIST_VIEW_START: {
            let newState = state

            // if fetched view is a real view (not new view created, not search, etc.) we save it's id
            if (_isNumber(action.viewId) && action.viewId > 0) {
                newState = newState.setIn(['_internal', 'lastViewId'], action.viewId)
            }

            if (action.discreet) {
                newState = newState
                    .setIn(['_internal', 'loading', 'fetchListDiscreet'], true)
            } else {
                newState = newState
                    .setIn(['_internal', 'loading', 'fetchList'], true)
                    .setIn(['_internal', 'selectedItemsIds'], fromJS([]))
            }

            return newState
        }

        case constants.FETCH_LIST_VIEW_SUCCESS: {
            const payload = action.data

            return state
                .setIn(['_internal', 'navigation'], fromJS(payload.meta))
                .setIn(['_internal', 'loading', 'fetchList'], false)
                .setIn(['_internal', 'loading', 'fetchListDiscreet'], false)
        }

        case constants.FETCH_LIST_VIEW_ERROR:
            return state.setIn(['_internal', 'loading', 'fetchList'], false)
                .setIn(['_internal', 'loading', 'fetchListDiscreet'], false)

        case constants.UPDATE_PAGE_SELECTION: {
            return state.setIn(['_internal', 'selectedItemsIds'], action.ids)
        }

        case constants.TOGGLE_ID_IN_PAGE_SELECTION: {
            const currentlySelected = state.getIn(['_internal', 'selectedItemsIds'], fromJS([]))

            const idx = currentlySelected.indexOf(action.id)

            // if already selected, deselect it
            if (~idx) {
                return state.setIn(['_internal', 'selectedItemsIds'], currentlySelected.delete(idx))
            }

            // otherwise select it
            return state.setIn(['_internal', 'selectedItemsIds'], currentlySelected.push(action.id))
        }

        case constants.TOGGLE_VIEW_SELECTION: {
            return state.updateIn(['active', 'allItemsSelected'], (allItemsSelected) => !allItemsSelected)
        }

        case constants.BULK_DELETE_SUCCESS: {
            return state
                .setIn(['_internal', 'selectedItemsIds'], fromJS([]))
        }

        case constants.SET_PAGE: {
            return state.setIn(['_internal', 'pagination', 'page'], action.page)
        }

        case constants.UPDATE_COUNTS: {
            const viewIds = Object.keys(action.counts)
            return state
            // update view counts
                .mergeDeep({
                    counts: action.counts
                })
                // update datetime when we receive count for a recent view
                .update('recent', (views) => {
                    return views.map((view, viewId) => {
                        if (viewIds.includes(viewId)) {
                            return view.set('updated_datetime', moment.utc().toISOString())
                        }
                        return view
                    })
                })
        }

        default:
            return state
    }
}
