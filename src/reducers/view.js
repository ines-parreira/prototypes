import esprima from 'esprima'
import escodegen from 'escodegen'
import {fromJS, List, Map} from 'immutable'
import * as actions from '../actions/view'


const viewsInitial = Map({
    items: List(),
    active: Map(),
    loading: false
})

// traverse filters_ast, find all the call expressions and return a new tree
function addFilterAST(view, filter) {
    // generate a new call expression for the new filter as a string
    const newCallExprCode = `${filter.operator}(${filter.left}, ${filter.right})`
    // since we only ever have AND operators just concatenate existing expressions
    const newCode = `${view.get('filters')} && ${newCallExprCode}`
    return fromJS(esprima.parse(newCode))
}

// traverse filters_ast, remove the call expressions and return a new tree
function removeFilterAST(view, index) {
    // As always, we assume that we only have && operators
    const codeSplit = view.get('filters').split('&&')
    codeSplit.splice(index, 1)
    if (codeSplit.length !== 0) {
        return fromJS(esprima.parse(codeSplit.join('&&')))
    }
    return ''
}

// shortcut for sorting items
function sortViews(items, key = 'display_order') {
    return items.sort((a, b) => a.get(key) - b.get(key))
}

export function views(state = viewsInitial, action) {
    let items
    let ast = ''
    let code = ''
    let view = state.get('active')

    switch (action.type) {
        case actions.SET_VIEW_ACTIVE:
            return state.set('active', action.view)

        case actions.UPDATE_VIEW:
            return state.set('active', action.view.set('dirty', true))

        case actions.UPDATE_VIEW_FIELD:
            // replace a field with a new field
            view = view.set('fields', view.get('fields').map((f) => {
                return (f.get('name') === action.field.get('name')) ? action.field : f
            }))

            return state.set('active', view.set('dirty', true))

        case actions.ADD_VIEW_FIELD_FILTER:
            // given a filter and our code+ast => generate new code/ast and save it to the state
            ast = addFilterAST(view, action.filter)
            code = escodegen.generate(ast.toJS(), {
                format: {
                    semicolons: false
                }
            })
            view = view.set('filters_ast', ast).set('filters', code)
            return state.set('active', view.set('dirty', true))

        case actions.REMOVE_VIEW_FIELD_FILTER:
            ast = removeFilterAST(view, action.index)
            if (ast) {
                code = escodegen.generate(ast.toJS(), {
                    format: {
                        semicolons: false
                    }
                })
            }
            view = view.set('filters_ast', ast).set('filters', code)
            return state.set('active', view.set('dirty', true))

        case actions.UPDATE_VIEW_FIELD_ENUM_SUCCESS:
            // update our active view with the new data from the API
            // to do that we need to change all the fields with a new list of fields
            view = view.set('fields', view.get('fields').map(f => {
                // names of fields are unique
                if (f.get('name') === action.field.get('name')) {
                    const filter = action.field.get('filter').set('enum', action.resp.data)
                    return action.field.set('filter', filter)
                }
                return f
            }))

            return state.set('active', view)

        case actions.RESET_VIEW: {
            // find the original view from the state and replace the active view
            const original = state.get('items').find(v => v.get('id') === view.get('id'))
            return state.set('active', original.set('dirty', false))
        }

        case actions.SUBMIT_UPDATE_VIEW_SUCCESS: {
            const updatedView = fromJS(action.resp)
            // we need to replace the old view with the new one
            items = state.get('items')
            const replaceIndex = items.findIndex(v => (v.get('id') === updatedView.get('id')))
            return state.merge({
                items: sortViews(items.delete(replaceIndex).push(updatedView)),
                active: updatedView.set('dirty', false)
            })
        }
        case actions.SUBMIT_NEW_VIEW_SUCCESS: {
            const newView = fromJS(action.resp)
            return state.merge({
                items: sortViews(state.get('items').push(newView)),
                active: newView.set('dirty', false)
            })
        }

        case actions.FETCH_VIEW_LIST_START:
            return state.set('loading', true)

        case actions.FETCH_VIEW_LIST_SUCCESS: {
            items = sortViews(fromJS(action.resp.data))

            // also populate the active view state
            const slug = action.currentViewSlug
            const active = items.filter(v => v.get('slug') === slug).get(0)

            return state.merge({
                items,
                active: active ? active.set('dirty', false) : null,
                loading: false
            })
        }

        case actions.SUBMIT_VIEW_START:
        default:
            return state
    }
}
