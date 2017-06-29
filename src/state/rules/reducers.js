import {fromJS, OrderedMap} from 'immutable'
import fromPairs from 'lodash/fromPairs'
import {getCode, getAST} from '../../utils'
import {updateCodeAst} from '../../pages/common/components/ast/utils'

import * as types from './constants'

export const initialState = fromJS({
    _internal: {
        dirtyList: []
    },
    rules: {}
})

function markAsDirty(ruleId, state) {
    if (!state.getIn(['_internal', 'dirtyList']).contains(ruleId)) {
        return state.setIn(
            ['_internal', 'dirtyList'],
            state.getIn(['_internal', 'dirtyList']).push(ruleId)
        )
    }

    return state
}

function markAsClean(ruleId, state) {
    if (!state.getIn(['_internal', 'dirtyList']).contains(ruleId)) {
        return state.setIn(
            ['_internal', 'dirtyList'],
            state.getIn(['_internal', 'dirtyList']).filter(id => id !== ruleId.toString())
        )
    }

    return state
}

export default (state = initialState, action) => {
    switch (action.type) {
        case types.ADD_RULE_END: {
            const rule = action.rule
            if (rule.code) {
                rule.code_ast = getAST(rule.code)
            }

            // Make sure when we add a new rule it's at the top
            const newRule = OrderedMap().set(rule.id.toString(), fromJS(rule))
            return state.set('rules', newRule.merge(state.get('rules')))
        }

        case types.ACTIVATE_RULE: {
            return state.updateIn(
                ['rules', action.id.toString()],
                r => r.set('deactivated_datetime', null)
            )
        }

        case types.DEACTIVATE_RULE: {
            return state.updateIn(
                ['rules', action.id.toString()],
                r => r.set('deactivated_datetime', (new Date()).toISOString())
            )
        }

        case types.REMOVE_RULE: {
            return state.set(
                'rules',
                state.get('rules').remove(action.id.toString())
            )
        }

        case types.RULES_RECEIVE_POSTS: {
            // Given the code of the rules received from server convert the code to AST
            const rules = action.rules.map((ruleItem) => {
                if (ruleItem.code) {
                    ruleItem.code_ast = getAST(ruleItem.code)
                }

                return [ruleItem.id, ruleItem]
            })
            return state.set(
                'rules',
                fromJS(fromPairs(rules))
                    .sort((a, b) => a.get('created_datetime') < b.get('created_datetime'))
                    .sort((a, b) => a.get('type') < b.get('type')) // system rules at the end
            )
        }

        case types.RULES_INITIALISE_CODE_AST: {
            const {id} = action
            let stateItem = state.getIn(['rules', id.toString()])

            // let ast = types.DEFAULT_IF_STATEMENT
            let ast = types.DEFAULT_STATEMENT
            const code = getCode(ast)
            ast = getAST(code)

            stateItem = stateItem.set('code_ast', fromJS(ast))
            stateItem = stateItem.set('code', code)

            markAsDirty(id.toString(), state)

            return markAsDirty(
                id.toString(),
                state.setIn(['rules', id.toString()], stateItem)
            )
        }

        case types.RULES_UPDATE_CODE_AST: {
            const {path, value, operation, schemas} = action
            const id = action.id.toString()
            const ast = state.getIn(['rules', id, 'code_ast'])

            const updatedCodeAst = fromJS(updateCodeAst(schemas, ast, path, value, operation))

            const newState = state
                .setIn(['rules', id, 'code'], updatedCodeAst.get('code'))
                .setIn(['rules', id, 'code_ast'], updatedCodeAst.get('ast'))

            return markAsDirty(id, newState)
        }

        case types.UPDATE_RULE_SUCCESS: {
            const newState = markAsClean(action.ruleId, state)
            return newState.update('rules', rules => rules.set(action.ruleId.toString(), action.rule))
        }

        case types.RESET_RULE_SUCCESS:
        case types.UPDATE_RULE_ERROR:
            return markAsClean(action.ruleId, state)

        default:
            return state
    }
}
