// @flow
import {fromJS, OrderedMap} from 'immutable'
import _fromPairs from 'lodash/fromPairs'
import _find from 'lodash/find'

import {getCode, getAST} from '../../utils'
import {updateCodeAst} from '../../pages/common/components/ast/utils'

import * as constants from './constants'

import type {Map} from 'immutable'
import type {actionType} from '../types'

export const initialState = fromJS({
    rules: {}
})

export default (state: Map<*,*> = initialState, action: actionType): Map<*,*> => {
    switch (action.type) {
        case constants.ADD_RULE_END: {
            const rule = action.rule
            if (rule.code) {
                rule.code_ast = getAST(rule.code)
            }

            // Make sure when we add a new rule it's at the top
            const newRule = OrderedMap().set(rule.id.toString(), fromJS(rule))
            return state.set('rules', newRule.merge(state.get('rules')))
        }

        case constants.ACTIVATE_RULE: {
            return state.updateIn(
                ['rules', action.id.toString()],
                (rule) => rule.set('deactivated_datetime', null)
            )
        }

        case constants.DEACTIVATE_RULE: {
            return state.updateIn(
                ['rules', action.id.toString()],
                (rule) => rule.set('deactivated_datetime', (new Date()).toISOString())
            )
        }

        case constants.UPDATE_ORDER_START: {
            const {priorities} = action
            return state.update('rules', (rules) => {
                return rules.map((rule) => {
                    const newPriorityData = _find(priorities, {id: rule.get('id')})

                    if (!newPriorityData) {
                        return rule
                    }

                    return rule.set('priority', newPriorityData.priority)
                })
            })
        }

        case constants.REMOVE_RULE: {
            return state.set(
                'rules',
                state.get('rules').remove(action.id.toString())
            )
        }

        case constants.RULES_RECEIVE_POSTS: {
            // Given the code of the rules received from server convert the code to AST
            const rules = action.rules.map((ruleItem) => {
                if (ruleItem.code) {
                    ruleItem.code_ast = getAST(ruleItem.code)
                }

                return [ruleItem.id, ruleItem]
            })
            return state.set(
                'rules',
                fromJS(_fromPairs(rules))
                    .sort((a, b) => a.get('created_datetime') < b.get('created_datetime'))
                    .sort((a, b) => a.get('type') < b.get('type')) // system rules at the end
            )
        }

        case constants.RULES_INITIALISE_CODE_AST: {
            const {id} = action
            let stateItem = state.getIn(['rules', id.toString()], fromJS({}))

            // let ast = constants.DEFAULT_IF_STATEMENT
            let ast = constants.DEFAULT_STATEMENT
            const code = getCode(ast)
            ast = getAST(code)

            stateItem = stateItem.set('code_ast', fromJS(ast))
            stateItem = stateItem.set('code', code)

            return state.setIn(['rules', id.toString()], stateItem)
        }

        case constants.RULES_UPDATE_CODE_AST: {
            const {path, value, operation, schemas} = action
            const id = action.id.toString()
            const ast = state.getIn(['rules', id, 'code_ast'])

            const updatedCodeAst = fromJS(updateCodeAst(schemas, ast, path, value, operation))

            return state
                .setIn(['rules', id, 'code'], updatedCodeAst.get('code'))
                .setIn(['rules', id, 'code_ast'], updatedCodeAst.get('ast'))
        }

        case constants.UPDATE_RULE_START: {
            return state.updateIn(['rules', String(action.ruleId)], (rule) => {
                return rule.mergeDeep(action.rule)
            })
        }

        case constants.UPDATE_RULE_SUCCESS: {
            return state.update('rules', (rules) => rules.set(action.ruleId.toString(), action.rule))
        }

        case constants.RESET_RULE_SUCCESS:
            return state.setIn(['rules', action.rule.id.toString()], fromJS(action.rule))

        default:
            return state
    }
}
