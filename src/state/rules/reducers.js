import {fromJS, List} from 'immutable'
import {getCode, getAST} from '../../utils'
import {inOrderGetLeaves, getObjectExpression} from './utils'

import {ADD_RULE_END, RULES_REQUESTS_POSTS, RULES_RECEIVE_POSTS, RULES_UPDATE_CODE_AST} from './constants'
import {DEFAULT_OPTION_CHAINS} from '../../pages/common/components/ast/Widget.js'

export const initialState = List([])

export default (state = initialState, action) => {
    switch (action.type) {
        case ADD_RULE_END:
            const rule = action.rule
            rule.code_ast = getAST(rule.code)
            return state.push(rule)

        case RULES_REQUESTS_POSTS:
            return state

        case RULES_RECEIVE_POSTS:
            // Given the code of the rules received from server convert the code to AST
            const ruleList = action.rules.map((ruleItem) => {
                ruleItem.code_ast = getAST(ruleItem.code)
                return ruleItem
            })

            return List(ruleList)

        case RULES_UPDATE_CODE_AST: {
            const {index, path, value, operation} = action
            const stateItem = fromJS(state.get(index))
            const pathFull = path.unshift('code_ast')

            let stateItemNew

            if (operation === 'UPDATE') {
                stateItemNew = stateItem.updateIn(pathFull.toJS(), val=>value)
                /* When we do an update for a node, the possible choices after that
                 * node should be invalidated.
                 * e.g. if(equal(ticket.status,'open')){}
                 * When "status" is changed to "channel", both the "equal" and "open" should
                 * be invalidated.
                 */

                // Do the updates only in the Ifstatement.test
                if (pathFull.contains('test')) {
                    let index = pathFull.lastIndexOf('arguments')
                    if (~index) {
                        const pathParentCallExpression = pathFull.setSize(pathFull.count() - index - 1)
                        const possiblePaths = inOrderGetLeaves(stateItemNew, pathParentCallExpression)

                        let shouldUpdate = false

                        // Update all the leaves on the right side of this one.
                        for (const pathItem of possiblePaths) {
                            if (shouldUpdate) {
                                stateItemNew = stateItemNew.updateIn(pathItem, val=>'')
                            }

                            if (pathFull.equals(pathItem)) {
                                shouldUpdate = true
                            }
                        }
                    } else {
                        index = pathFull.lastIndexOf('callee')
                    }
                } else {
                    /*
                     * Update the arguments for actions when action name is updated.
                     * */
                    const index = pathFull.lastIndexOf('arguments')
                    const index2 = pathFull.lastIndexOf(1)
                    if (~index && ~index2 && (index - index2 === 1)) {
                        const pathParentCallExpression = pathFull.setSize(pathFull.count() - index - 1)
                        const calleeName = stateItemNew.getIn(pathParentCallExpression.push('callee', 'name'))
                        if (calleeName === 'Action') {
                            const pathArgument1 = pathParentCallExpression.push('arguments', 1, 'value')
                            const argument1 = stateItemNew.getIn(pathArgument1.toJS())
                            const pathAction = ['_action', argument1]
                            const actionDict = fromJS(DEFAULT_OPTION_CHAINS).getIn(pathAction).toJS()
                            const objectExpression = getObjectExpression(actionDict)

                            stateItemNew = stateItemNew.updateIn(pathParentCallExpression.push('arguments', 2).toJS(), val=>objectExpression)
                        }
                    }
                }
            }

            if (operation === 'INSERT') {
                const lastIndex = pathFull.last() + 1
                const pathNew = pathFull.pop()
                const valueP = stateItem.getIn(pathNew.toJS())

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
                 * */
                if ((valueP === undefined) && (pathNew.get(pathNew.size - 2) === 'alternate')) {
                    const pathElse = pathNew.pop()
                    stateItemNew = stateItem.updateIn(pathElse.toJS(), val=>fromJS({
                        type: "BlockStatement",
                        body: [value],
                    }))
                } else {
                    stateItemNew = stateItem.updateIn(pathNew.toJS(), list=>list.splice(lastIndex, 0, value))
                }
            }
            if (operation === 'DELETE') {
                const lastIndex = pathFull.last()
                const pathNew = pathFull.pop()
                stateItemNew = stateItem.updateIn(pathNew.toJS(), list=>list.delete(lastIndex))
            }

            /* Add logical AND operation in TEST block of IFSTATEMENT.
             */
            if (operation === 'UPDATE_LOGICAL_AND') {
                const test = stateItem.getIn(pathFull.toJS())
                value.right = test.toJS()
                stateItemNew = stateItem.updateIn(pathFull.toJS(), val=>value)
            }

            /* Operating on the syntax tree to delete the binary expression.
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
                    stateItemNew = stateItem.updateIn(pathNew.toJS(), val=>right)
                } else if (lastIndex === 'right') {
                    const left = stateItem.getIn(pathNew.push('left').toJS())
                    stateItemNew = stateItem.updateIn(pathNew.toJS(), val=>left)
                } else {
                    // We shouldn't reach here normally.
                    return state
                }
            }

            let stateItemObj = stateItemNew.toJS()
            stateItemObj.code = getCode(stateItemObj.code_ast)
            const stateNew = state.set(index, stateItemObj)
            return stateNew
        }

        default:
            return state
    }
}
