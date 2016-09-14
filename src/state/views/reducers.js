import {fromJS} from 'immutable'
import * as types from './constants'
import {getCode} from '../../utils'
import {
    addFilterAST,
    removeFilterAST,
    updateFilterOperator,
    updateFilterValue,
    sortViews
} from './utils'

const initialState = fromJS({
    items: [],
    active: {},
    loading: false
})

export default (state = initialState, action) => {
    let items
    let ast = ''
    let code = ''
    let active = state.get('active')

    switch (action.type) {
        case types.SET_VIEW_ACTIVE:
            if (action.view) {
                return state.set('active', action.view)
            }
            return state

        case types.UPDATE_VIEW:
            // edit is true by default,
            // for backwards compatibility.
            return state.set('active', action.view.set('dirty', true).set('editMode', action.edit))

        case types.UPDATE_VIEW_FIELD:
            // replace a field with a new field
            active = active.set('fields', active.get('fields').map((f) => (
                (f.get('name') === action.field.get('name')) ? action.field : f
            )))

            // enter edit mode
            active = active.set('editMode', true)

            return state.set('active', active.set('dirty', true))

        case types.ADD_VIEW_FIELD_FILTER:
            // given a filter and our code+ast => generate new code/ast and save it to the state
            ast = addFilterAST(active, action.filter)
            code = getCode(ast.toJS())
            active = active.set('filters_ast', ast).set('filters', code)
            return state.set('active', active.set('dirty', true))

        case types.REMOVE_VIEW_FIELD_FILTER:
            ast = removeFilterAST(active, action.index)
            if (ast) {
                code = getCode(ast.toJS())
            }
            active = active.set('filters_ast', ast).set('filters', code)
            return state.set('active', active.set('dirty', true))

        case types.UPDATE_VIEW_FIELD_FILTER:
            ast = updateFilterValue(active, action.index, action.value)
            code = getCode(ast.toJS())
            active = active.set('filters_ast', ast).set('filters', code)
            return state.set('active', active)

        case types.UPDATE_VIEW_FIELD_FILTER_OPERATOR:
            ast = updateFilterOperator(active, action.index, action.operator)
            code = getCode(ast.toJS())
            active = active.set('filters_ast', ast).set('filters', code)
            return state.set('active', active)

        case types.UPDATE_VIEW_FIELD_ENUM_SUCCESS:
            // update our active view with the new data from the API
            // to do that we need to change all the fields with a new list of fields
            active = active.set('fields', active.get('fields').map(f => {
                // names of fields are unique
                if (f.get('name') === action.field.get('name')) {
                    const filter = action.field.get('filter').set('enum', action.resp.data)
                    return action.field.set('filter', filter)
                }
                return f
            }))

            return state.set('active', active)

        case types.RESET_VIEW: {
            // find the original view from the state and replace the active view
            const original = state.get('items').find(v => v.get('id') === active.get('id'))
            return state.set('active', original.set('dirty', false))
        }

        case types.SUBMIT_UPDATE_VIEW_SUCCESS: {
            const updatedView = fromJS(action.resp)
            // we need to replace the old view with the new one
            items = state.get('items')
            const replaceIndex = items.findIndex(v => (v.get('id') === updatedView.get('id')))
            return state.merge({
                items: sortViews(items.delete(replaceIndex).push(updatedView)),
                active: updatedView.set('dirty', false)
            })
        }

        case types.SUBMIT_NEW_VIEW_SUCCESS: {
            const newView = fromJS(action.resp)
            return state.merge({
                items: sortViews(state.get('items').push(newView)),
                active: newView.set('dirty', false)
            })
        }

        case types.FETCH_VIEW_LIST_START:
            return state.set('loading', true)

        case types.UPDATE_VIEW_LIST:
            return state.set('items', sortViews(fromJS(action.items)))

        case types.FETCH_VIEW_LIST_SUCCESS: {
            items = sortViews(fromJS(action.resp.data))

            // also populate the active view state
            if (action.currentViewId) {
                active = items.find(item => item.get('id') === parseInt(action.currentViewId))
            }

            return state.merge({
                items,
                active,
                loading: false
            })
        }

        case types.DELETE_VIEW_SUCCESS:
            return state
                .merge({
                    items: state.get('items').filter(item => item.get('id') !== action.viewId),
                })
                .set('active', fromJS({}))

        case types.SUBMIT_VIEW_START:
        default:
            return state
    }
}
