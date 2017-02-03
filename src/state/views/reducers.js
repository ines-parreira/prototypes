import {fromJS} from 'immutable'
import * as types from './constants'
import {getCode} from '../../utils'
import SocketIO from '../../pages/common/utils/socketio'
import {
    addFilterAST,
    removeFilterAST,
    updateFilterOperator,
    updateFilterValue
} from './utils'

export const initialState = fromJS({
    items: [],
    active: {},
    loading: false,
    _internal: {
        currentViewId: null,
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
    let active = state.get('active', fromJS({}))

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
            // edit is true by default,
            // for backwards compatibility.
            return state.set('active', action.view.set('dirty', true).set('editMode', action.edit))
        }

        case types.SET_FIELD_VISIBILITY: {
            const visibleFields = active.get('fields', fromJS([]))

            const fields = action.state
                ? visibleFields.push(action.name)
                : visibleFields.delete(visibleFields.indexOf(action.name))

            active = active
                .set('fields', fields)
                .set('editMode', true)

            return state.set('active', active)
        }

        case types.ADD_VIEW_FIELD_FILTER: {
            // given a filter and our code+ast => generate new code/ast and save it to the state
            ast = addFilterAST(active, action.filter)
            code = getCode(ast.toJS())
            active = active.set('filters_ast', ast).set('filters', code)

            // enter edit mode
            active = active.set('editMode', true)

            return state.set('active', active.set('dirty', true))
        }

        case types.REMOVE_VIEW_FIELD_FILTER: {
            ast = removeFilterAST(active, action.index)
            if (ast) {
                code = getCode(ast.toJS())
            }
            active = active.set('filters_ast', ast).set('filters', code)
            return state.set('active', active.set('dirty', true))
        }

        case types.UPDATE_VIEW_FIELD_FILTER: {
            ast = updateFilterValue(active, action.index, action.value)
            code = getCode(ast.toJS())
            active = active.set('filters_ast', ast).set('filters', code)
            return state.set('active', active.set('dirty', true))
        }

        case types.UPDATE_VIEW_FIELD_FILTER_OPERATOR: {
            ast = updateFilterOperator(active, action.index, action.operator)
            code = getCode(ast.toJS())
            active = active.set('filters_ast', ast).set('filters', code)
            return state.set('active', active.set('dirty', true))
        }

        case types.RESET_VIEW: {
            // find the original view from the state and replace the active view
            const original = state.get('items').find(v => v.get('id') === active.get('id'), null, fromJS({}))
            return state.set('active', original.set('dirty', false))
        }

        case types.SUBMIT_UPDATE_VIEW_SUCCESS: {
            const updatedView = fromJS(action.resp)
            // we need to replace the old view with the new one
            items = state.get('items')
            const replaceIndex = items.findIndex(v => (v.get('id') === updatedView.get('id')))
            return state.merge({
                items: items.delete(replaceIndex).push(updatedView),
                active: updatedView.set('dirty', false)
            })
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
                active = items.find(item => item.get('id') === parseInt(action.currentViewId), null, fromJS({}))
            }

            return state.merge({
                items,
                active,
                loading: false
            })
        }

        case types.DELETE_VIEW_SUCCESS: {
            return state
                .merge({
                    items: state.get('items').filter(item => item.get('id') !== action.viewId),
                })
        }

        case types.FETCH_LIST_VIEW_START: {
            let newState = state.setIn(['_internal', 'currentViewId'], action.viewId)

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
            if (action.selectedAll) {
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

        case types.SAVE_INDEX: {
            return state.setIn(['_internal', 'currentItemIndex'], action.currentItemIndex)
        }

        case types.SET_PAGE: {
            return state.setIn(['_internal', 'pagination', 'page'], action.page)
        }

        default:
            return state
    }
}
