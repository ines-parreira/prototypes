import {fromJS, OrderedMap} from 'immutable'
import fromPairs from 'lodash/fromPairs'
import {getCode, getAST} from '../../utils'
import {updateCallExpression, getObjectExpression} from './utils'

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
            const newRule = OrderedMap().set(rule.id, fromJS(rule))
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

        case types.RULES_REQUESTS_POSTS:
            return state

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

            let ast = types.DEFAULT_IF_STATEMENT
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
            const {id, path, value, operation, schemas} = action
            const stateItem = state.getIn(['rules', id.toString()])
            const pathFull = path.unshift('code_ast')

            let stateItemNew

            if (operation === 'UPDATE') {
                // First update the value directly based on the full path
                stateItemNew = stateItem.updateIn(pathFull.toJS(), () => value)

                /* When we do an update for a node, the possible choices after that
                 * node will be generated with a default value
                 * Ex: if(eq(ticket.status,'open')){}
                 * When "status" is changed to "channel", the expression is transformed to:
                 * if (eq(ticket.channel, 'email')){}
                 */

                // Do the updates only in the IfStatement.test
                if (pathFull.contains('test')) {
                    const argumentsIndex = pathFull.lastIndexOf('arguments')
                    if (~argumentsIndex) {
                        const pathParentCallExpression = pathFull.setSize(argumentsIndex)
                        // generate a new CallExpression with some default values based on the schema
                        stateItemNew = updateCallExpression(
                            stateItemNew,
                            pathParentCallExpression,
                            pathFull,
                            schemas
                        )
                    }
                } else {
                    // Update the arguments for actions when action name is updated
                    const argumentsIndex = pathFull.lastIndexOf('arguments')
                    const index2 = pathFull.lastIndexOf(0)

                    // We check if this update, edit the first argument of a CallExpression
                    if (~argumentsIndex && ~index2 && (index2 - argumentsIndex) === 1) {
                        const pathParentCallExpression = pathFull.setSize(argumentsIndex)
                        const calleeName = stateItemNew.getIn(pathParentCallExpression.push('callee', 'name'))

                        if (calleeName === 'Action') {
                            // We override the second argument with the default value of the new action type
                            // This is done so we have a default value for a newly created action
                            stateItemNew = stateItemNew.updateIn(
                                pathParentCallExpression.push('arguments', 1),
                                () => getObjectExpression(types.ACTION_DEFAULT_STATE[value] || {})
                            )
                        }
                    }
                }
            }

            if (operation === 'INSERT') {
                const valueP = stateItem.getIn(pathFull.toJS())

                /*
                 * In the case of pathNew = ["code_ast", "body", 0, "alternate", "body"]
                 * But in the real code, else part, "alternate" is null.
                 * We need to change the code
                 * I)  if(x){}
                 * to
                 * II) if(x){} else{}
                 *
                 * In the Syntax tree level, it's equivalent to change
                 * I)  "alternate": null
                 * to
                 * II) "alternate": {
                 *        "type": "BlockStatement"
                 *        "body": []
                 *     }
                 */

                if ((valueP === undefined) && (pathFull.get(pathFull.size - 2) === 'alternate')) {
                    const pathElse = pathFull.pop()
                    stateItemNew = stateItem.updateIn(pathElse.toJS(), () => fromJS({
                        type: 'BlockStatement',
                        body: [value],
                    }))
                } else {
                    stateItemNew = stateItem.updateIn(pathFull.toJS(), list => list.push(value))
                }
            }
            if (operation === 'DELETE') {
                const lastIndex = pathFull.last()
                const pathNew = pathFull.pop()
                stateItemNew = stateItem.updateIn(pathNew.toJS(), list => list.delete(lastIndex))
            }

            // Add logical AND operation in TEST block of IFSTATEMENT.
            if (operation === 'UPDATE_LOGICAL_AND') {
                const test = stateItem.getIn(pathFull.toJS())
                value.left = test.toJS()
                stateItemNew = stateItem.updateIn(pathFull.toJS(), () => value)
            }

            /*
             * Operating on the syntax tree to delete the binary expression.
             * We assume the statement includes only AND. And the order is
             * enforced like:
             * if (ticket.status == 'channel' && (ticket.status == 'channel' && ticket.status == 'new'))
             *
             * This assumption will stay true since in UPDATE_LOGICAL_AND, we force this order.
             */

            if (operation === 'DELETE_BINARY_EXPRESSION') {
                const lastIndex = pathFull.last()
                const pathNew = pathFull.pop()

                if (lastIndex === 'left') {
                    const right = stateItem.getIn(pathNew.push('right').toJS())
                    stateItemNew = stateItem.updateIn(pathNew.toJS(), () => right)
                } else if (lastIndex === 'right') {
                    const left = stateItem.getIn(pathNew.push('left').toJS())
                    stateItemNew = stateItem.updateIn(pathNew.toJS(), () => left)
                } else {
                    // We shouldn't reach here normally.
                    return state
                }
            }

            const stateItemObj = stateItemNew.toJS()
            stateItemObj.code = getCode(stateItemObj.code_ast)
            stateItemObj.code_ast = getAST(stateItemObj.code)  // To apply, ast syntax options (loc, ...)

            return markAsDirty(
                id.toString(),
                state.setIn(['rules', id.toString()], fromJS(stateItemObj))
            )
        }

        case types.RESET_RULE_SUCCESS:
        case types.UPDATE_RULE_SUCCESS:
        case types.UPDATE_RULE_ERROR:
            return markAsClean(action.ruleId, state)

        default:
            return state
    }
}
