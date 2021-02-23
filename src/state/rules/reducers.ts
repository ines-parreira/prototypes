import esprima from 'esprima'
import {fromJS, OrderedMap, Map} from 'immutable'
import _fromPairs from 'lodash/fromPairs'
import _find from 'lodash/find'

import {getCode, getAST} from '../../utils'
import {updateCodeAst} from '../../pages/common/components/ast/utils.js'

import {GorgiasAction} from '../types'

import * as constants from './constants.js'
import {RulesState, Rule} from './types'

export const initialState: RulesState = fromJS({
    rules: {},
})

export default function reducer(
    state: RulesState = initialState,
    action: GorgiasAction
): RulesState {
    switch (action.type) {
        case constants.ADD_RULE_END: {
            const rule = action.rule as Rule
            if (rule.code) {
                rule.code_ast = getAST(rule.code)
            }

            // Make sure when we add a new rule it's at the top
            const newRule = OrderedMap().set(rule.id.toString(), fromJS(rule))
            return state.set('rules', newRule.merge(state.get('rules')))
        }

        case constants.ACTIVATE_RULE: {
            return state.updateIn(
                ['rules', action.id?.toString()],
                (rule: Map<any, any>) => rule.set('deactivated_datetime', null)
            )
        }

        case constants.DEACTIVATE_RULE: {
            return state.updateIn(
                ['rules', action.id?.toString()],
                (rule: Map<any, any>) =>
                    rule.set('deactivated_datetime', new Date().toISOString())
            )
        }

        case constants.UPDATE_ORDER_START: {
            const {priorities} = action
            return state.update('rules', (rules: OrderedMap<any, any>) => {
                return rules.map((rule: Map<any, any>) => {
                    const newPriorityData = _find(priorities, {
                        id: rule.get('id'),
                    })

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
                (state.get('rules') as OrderedMap<any, any>).remove(
                    action.id?.toString()
                )
            )
        }

        case constants.RULES_RECEIVE_POSTS: {
            // Given the code of the rules received from server convert the code to AST
            const rules = action.rules?.map((ruleItem) => {
                if (ruleItem.code) {
                    ruleItem.code_ast = getAST(ruleItem.code)
                }

                return [ruleItem.id, ruleItem]
            })
            return state.set(
                'rules',
                ((fromJS(_fromPairs(rules)) as OrderedMap<any, any>).sort(
                    ((a: Map<any, any>, b: Map<any, any>) =>
                        a.get('created_datetime') <
                        b.get('created_datetime')) as any
                ) as OrderedMap<any, any>).sort(
                    ((a: Map<any, any>, b: Map<any, any>) =>
                        a.get('type') < b.get('type')) as any
                ) // system rules at the end
            )
        }

        case constants.RULES_INITIALISE_CODE_AST: {
            const {id} = action
            let stateItem = state.getIn(
                ['rules', id?.toString()],
                fromJS({})
            ) as Map<any, any>

            // let ast = constants.DEFAULT_IF_STATEMENT
            let ast = constants.DEFAULT_STATEMENT as ReturnType<
                typeof esprima.parse
            >
            const code = getCode(ast as any)
            ast = getAST(code)

            stateItem = stateItem.set('code_ast', fromJS(ast))
            stateItem = stateItem.set('code', code)

            return state.setIn(['rules', id?.toString()], stateItem)
        }

        case constants.RULES_UPDATE_CODE_AST: {
            const {path, value, operation, schemas} = action
            const id = action.id?.toString()
            const ast = state.getIn(['rules', id, 'code_ast'])

            const updatedCodeAst = fromJS(
                updateCodeAst(schemas, ast, path, value, operation)
            ) as Map<any, any>

            return state
                .setIn(['rules', id, 'code'], updatedCodeAst.get('code'))
                .setIn(['rules', id, 'code_ast'], updatedCodeAst.get('ast'))
        }

        case constants.UPDATE_RULE_START: {
            return state.updateIn(
                ['rules', String(action.ruleId)],
                (rule: Map<any, any>) => {
                    return rule.mergeDeep(
                        (action.rule as unknown) as Map<any, any>
                    )
                }
            )
        }

        case constants.UPDATE_RULE_SUCCESS: {
            return state.update('rules', (rules: OrderedMap<any, any>) =>
                rules.set(action.ruleId?.toString(), action.rule)
            )
        }

        case constants.RESET_RULE_SUCCESS:
            return state.setIn(
                ['rules', action.rule?.id.toString()],
                fromJS(action.rule)
            )

        case constants.RULE_UPDATED:
            return state.setIn(
                [
                    'rules',
                    ((action as {payload: Map<any, any>}).payload.get(
                        'id'
                    ) as number).toString(),
                ],
                action.payload
            )

        default:
            return state
    }
}
