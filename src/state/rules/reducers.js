import {fromJS, List} from 'immutable'

import {getCode, getAST} from '../../utils'
import {inOrderGetLeaves, getObjectExpression} from './utils'

import * as types from './constants'

export const initialState = List([])

export default (state = initialState, action) => {
    switch (action.type) {
        case types.ADD_RULE_END: {
            const rule = action.rule

            if (rule.code) {
                rule.code_ast = getAST(rule.code)
            }

            return state.push(rule)
        }

        case types.REMOVE_RULE: {
            return state.remove(action.index)
        }

        case types.RULES_REQUESTS_POSTS:
            return state

        case types.RULES_RECEIVE_POSTS: {
            // Given the code of the rules received from server convert the code to AST
            const ruleList = action.rules.map((ruleItem) => {
                if (ruleItem.code) {
                    ruleItem.code_ast = getAST(ruleItem.code)
                }

                return ruleItem
            })

            return List(ruleList)
        }

        case types.RULES_INITIALISE_CODE_AST: {
            const {index} = action
            let stateItem = fromJS(state.get(index))

            stateItem = stateItem.set('code_ast', types.DEFAULT_IF_STATEMENT)

            const stateItemObj = stateItem.toJS()
            stateItemObj.code = getCode(stateItemObj.code_ast)
            // We need this in order to get the AST options such as (loc).
            // This will be used later on for doing debugging for example.
            stateItemObj.code_ast = getAST(stateItemObj.code)
            return state.set(index, stateItemObj)
        }

        case types.RULES_UPDATE_CODE_AST: {
            const {index, path, value, operation} = action
            const stateItem = fromJS(state.get(index))
            const pathFull = path.unshift('code_ast')

            let stateItemNew

            if (operation === 'UPDATE') {
                stateItemNew = stateItem.updateIn(pathFull.toJS(), () => value)
                /* When we do an update for a node, the possible choices after that
                 * node should be invalidated.
                 * e.g. if(equal(ticket.status,'open')){}
                 * When "status" is changed to "channel", both the "equal" and "open" should
                 * be invalidated.
                 */

                // Do the updates only in the Ifstatement.test
                if (pathFull.contains('test')) {
                    const argumentsIndex = pathFull.lastIndexOf('arguments')

                    if (~argumentsIndex) {
                        const pathParentCallExpression = pathFull.setSize(argumentsIndex)
                        const possiblePaths = inOrderGetLeaves(stateItemNew, pathParentCallExpression)

                        let shouldUpdate = false

                        // Update all the leaves on the right side of this one
                        for (const pathItem of possiblePaths) {
                            if (shouldUpdate) {
                                stateItemNew = stateItemNew.updateIn(pathItem, () => '')
                            } else {
                                shouldUpdate = pathFull.equals(pathItem)
                            }
                        }
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
                value.right = test.toJS()
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
            return state.set(index, stateItemObj)
        }

        default:
            return state
    }
}
