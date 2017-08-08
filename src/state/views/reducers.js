import {fromJS} from 'immutable'
import _isNumber from 'lodash/isNumber'

import {EMPTY_OPERATORS} from '../../config'

import * as types from './constants'
import {getCode} from '../../utils'
import {shouldUpdateView} from '../activity/utils'
import SocketIO from '../../pages/common/utils/socketio'
import {
    addFilterAST,
    removeFilterAST,
    updateFilterOperator,
    updateFilterValue
} from './utils'
import * as selectors from './selectors'

export const initialState = fromJS({
    items: [],
    counts: {},
    active: {},
    loading: false,
    _internal: {
        currentViewId: null,
        lastViewId: null,
        selectedItemsIds: [],
        loading: {
            fetchList: false,
            fetchListDiscreet: false,
        }
    }
})

export default (state = initialState, action) => {
    let items
    let ast = ''
    let code = ''
    let activeView = state.get('active', fromJS({}))

    switch (action.type) {
        case types.SET_VIEW_ACTIVE: {
            if (action.view) {
                const io = new SocketIO()
                io.joinView(action.view.get('id'))

                return state.set('active', action.view)
            }
            return state
        }

        case types.UPDATE_VIEW: {
            const view = action.view || activeView
            return state.set('active', view.set('dirty', true).set('editMode', action.edit))
        }

        case types.SET_FIELD_VISIBILITY: {
            const visibleFields = activeView.get('fields', fromJS([]))

            const fields = action.state
                ? visibleFields.push(action.name)
                : visibleFields.delete(visibleFields.indexOf(action.name))

            activeView = activeView.set('fields', fields)

            return state.set('active', activeView)
        }

        case types.SET_ORDER_DIRECTION: {
            return state.set('active', activeView.merge({
                order_by: action.fieldPath,
                order_dir: action.direction,
            }))
        }

        case types.ADD_VIEW_FIELD_FILTER: {
            // given a filter and our code+ast => generate new code/ast and save it to the state
            ast = addFilterAST(activeView, action.filter)
            code = getCode(ast.toJS())
            activeView = activeView.set('filters_ast', ast).set('filters', code)

            // enter edit mode
            activeView = activeView.set('editMode', true)

            return state.set('active', activeView.set('dirty', true))
        }

        case types.REMOVE_VIEW_FIELD_FILTER: {
            ast = removeFilterAST(activeView, action.index)
            if (ast) {
                code = getCode(ast.toJS())
            }
            activeView = activeView.set('filters_ast', ast).set('filters', code)
            return state.set('active', activeView.set('dirty', true))
        }

        case types.UPDATE_VIEW_FIELD_FILTER: {
            let ast = activeView.get('filters_ast')
            ast = updateFilterValue(ast, action.index, action.value)
            code = getCode(ast.toJS())
            activeView = activeView.set('filters_ast', ast).set('filters', code)
            return state.set('active', activeView.set('dirty', true))
        }

        case types.UPDATE_VIEW_FIELD_FILTER_OPERATOR: {
            let ast = activeView.get('filters_ast')
            ast = updateFilterOperator(ast, action.index, action.operator)

            if (Object.keys(EMPTY_OPERATORS).includes(action.operator)) {
                ast = updateFilterValue(ast, action.index, 0)
            }

            code = getCode(ast.toJS())
            activeView = activeView.set('filters_ast', ast).set('filters', code)
            return state.set('active', activeView.set('dirty', true))
        }

        case types.RESET_VIEW: {
            // find the original view from the state and replace the active view
            let original = selectors.getView(activeView.get('id'), action.configName)({views: state})

            // if it's a new view, it's ID should be 0
            const isUpdate = original.get('id') !== 0

            if (isUpdate) {
                // if is updating an existing view, on reset we close edition panel
                original = original.set('dirty', false).set('editMode', false)
            } else {
                // if creating a new viw, on reset we keep the edition panel open
                original = original.set('dirty', true).set('editMode', true)
            }

            return state.set('active', original)
        }

        case types.SUBMIT_UPDATE_VIEW_SUCCESS: {
            const updatedView = fromJS(action.resp)
            // we need to replace the old view with the new one
            items = state.get('items')
            const replaceIndex = items.findIndex(v => v.get('id') === updatedView.get('id'))
            let newState = state.setIn(['items', replaceIndex], updatedView)

            if (shouldUpdateView(updatedView.get('id'), state)) {
                newState = newState.set('active', updatedView.set('dirty', false))
            }

            return newState
        }

        case types.SUBMIT_NEW_VIEW_SUCCESS: {
            const newView = fromJS(action.resp)
            return state.merge({
                items: state.get('items').push(newView),
                active: newView.set('dirty', false)
            })
        }

        case types.FETCH_VIEW_LIST_START: {
            return state.set('loading', true)
        }

        case types.UPDATE_VIEW_LIST: {
            return state.set('items', fromJS(action.items))
        }

        case types.FETCH_VIEW_LIST_SUCCESS: {
            items = fromJS(action.resp.data)

            // also populate the active view state
            if (action.currentViewId) {
                activeView = items.find(item => item.get('id') === parseInt(action.currentViewId), null, fromJS({}))
            }

            return state.merge({
                items,
                active: activeView,
                loading: false
            })
        }

        case types.CREATE_VIEW_SUCCESS: {
            return state.update('items', (items) => items.push(fromJS(action.resp)))
        }

        case types.UPDATE_VIEW_SUCCESS: {
            let newState = state.update('items', (items) => items.map((v) => {
                if (v.get('id') === action.resp.id) {
                    return fromJS(action.resp)
                }
                return v
            }))
            // also update the active view if we're on it
            if (newState.getIn(['active', 'id']) === action.resp.id) {
                newState = newState.set('active', fromJS(action.resp))
            }
            return newState
        }

        case types.DELETE_VIEW_SUCCESS: {
            return state.merge({
                items: state.get('items').filter(item => item.get('id') !== action.viewId),
            })
        }

        case types.FETCH_LIST_VIEW_START: {
            let newState = state
                .setIn(['_internal', 'currentViewId'], action.viewId)

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

        case types.FETCH_LIST_VIEW_SUCCESS: {
            const payload = action.data

            return state
                .setIn(['_internal', 'pagination'], fromJS(payload.meta))
                .setIn(['_internal', 'loading', 'fetchList'], false)
                .setIn(['_internal', 'loading', 'fetchListDiscreet'], false)
        }

        case types.FETCH_LIST_VIEW_ERROR:
            return state.setIn(['_internal', 'loading', 'fetchList'], false)
                .setIn(['_internal', 'loading', 'fetchListDiscreet'], false)

        case types.TOGGLE_SELECTION: {
            const currentlySelected = state.getIn(['_internal', 'selectedItemsIds'], fromJS([]))

            // if it is a "select all" action where we select every items
            if (action.selectAll) {
                if (currentlySelected.size < action.idOrIds.size) {
                    return state.setIn(['_internal', 'selectedItemsIds'], action.idOrIds)
                }

                return state.setIn(['_internal', 'selectedItemsIds'], fromJS([]))
            }

            const idx = currentlySelected.indexOf(action.idOrIds)

            // if already selected, deselect it
            if (~idx) {
                return state.setIn(['_internal', 'selectedItemsIds'], currentlySelected.delete(idx))
            }

            // otherwise select it
            return state.setIn(['_internal', 'selectedItemsIds'], currentlySelected.push(action.idOrIds))
        }

        case types.BULK_DELETE_SUCCESS: {
            return state
                .setIn(['_internal', 'selectedItemsIds'], fromJS([]))
        }

        case types.SET_PAGE: {
            return state.setIn(['_internal', 'pagination', 'page'], action.page)
        }

        case types.UPDATE_COUNTS: {
            return state.mergeDeep({
                counts: action.counts
            })
        }

        default:
            return state
    }
}
