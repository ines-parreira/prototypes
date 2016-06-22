import Immutable from 'immutable'
import { getCode, getAST } from '../utils'

import { ADD_RULE_END, RULES_REQUESTS_POSTS, RULES_RECEIVE_POSTS, RULES_UPDATE_CODE_AST } from '../actions/rule'
import { DEFAULT_OPTION_CHAINS } from '../components/ast/Widget.js'

const initialState = Immutable.List([])

/**
 * In Order traversal the SYNTAXTREE from CURRENTPATH. Return a list
 * of possible paths to leaves.
 */
function inOrderGetLeaves(syntaxTree, currentPath) {
    const currentNode = syntaxTree.getIn(currentPath)

    if (currentNode.get('type') === 'Identifier') {
        return Immutable.List([]).push(currentPath.push('name'))
    }

    if (currentNode.get('type') === 'Literal') {
        return Immutable.List([]).push(currentPath.push('value'))
    }

    if (currentNode.get('type') === 'CallExpression') {
        const pathCallee = currentPath.push('callee')
        const pathArgument0 = currentPath.push('arguments', 0)
        const pathArgument1 = currentPath.push('arguments', 1)

        const leavesCallee = inOrderGetLeaves(syntaxTree, pathCallee)
        const leavesArgument0 = inOrderGetLeaves(syntaxTree, pathArgument0)
        const leavesArgument1 = inOrderGetLeaves(syntaxTree, pathArgument1)


        return leavesArgument0.push(...leavesCallee).push(...leavesArgument1)
    }

    if (currentNode.get('type') === 'BinaryExpression' || currentNode.get('type') === 'LogicalExpression') {
        const pathOperator = currentPath.push('operator')
        const pathLeft = currentPath.push('left')
        const pathRight = currentPath.push('right')

        const leavesOperator = Immutable.List([]).push(pathOperator)
        const leavesLeft = inOrderGetLeaves(syntaxTree, pathLeft)
        const leavesRight = inOrderGetLeaves(syntaxTree, pathRight)

        return leavesLeft.push(...leavesOperator).push(...leavesRight)
    }

    if (currentNode.get('type') === 'MemberExpression') {
        const pathObject = currentPath.push('object')
        const pathProperty = currentPath.push('property')

        const leavesObject = inOrderGetLeaves(syntaxTree, pathObject)
        const leavesProperty = inOrderGetLeaves(syntaxTree, pathProperty)

        return leavesObject.push(...leavesProperty)
    }
}

function getObjectExpression(actionDict) {
    let properties = []

    for (const keyItem in actionDict) {
        if (!actionDict.hasOwnProperty(keyItem)) {
            continue
        }


        const property = {
            type: 'Property',
            key: {
                type: 'Identifier',
                name: keyItem
            },
            computed: false,
            value: {
                type: 'Literal',
                value: '',
                raw: '\'\''
            },
            kind: 'init',
            method: false,
            shorthand: false
        }

        properties.push(property)
    }

    return {
        type: 'ObjectExpression',
        properties: properties
    }
}

export function rules(state = initialState, action) {
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

            return Immutable.List(ruleList)

        case RULES_UPDATE_CODE_AST:
        {
            const { index, path, value, operation } = action
            const stateitem = Immutable.fromJS(state.get(index))
            const pathFull = path.unshift('code_ast')

            let stateitemNew

            if (operation === 'UPDATE') {
                stateitemNew = stateitem.updateIn(pathFull.toJS(), val=>value)
                /* When we do an update for a node, the possible choices after that
                 * node should be invalidated.
                 * e.g. if(equal(ticket.status,'open')){}
                 * When "status" is changed to "channel", both the "equal" and "open" should
                 * be invalidated.
                 */

                // Do the updates only in the Ifstatement.test
                if (pathFull.contains('test')) {
                    let index = pathFull.lastIndexOf('arguments')
                    if (index === -1) {
                        index = pathFull.lastIndexOf('callee')
                    }

                    if (index !== -1) {
                        const pathParentCallExpression = pathFull.setSize(pathFull.count() - index - 1)
                        const possiblePaths = inOrderGetLeaves(stateitemNew, pathParentCallExpression)

                        let shouldUpdate = false

                        // Update all the leaves on the right side of this one.
                        for (const pathItem of possiblePaths) {
                            if (shouldUpdate) {
                                stateitemNew = stateitemNew.updateIn(pathItem, val=>'')
                            }

                            if (pathFull.equals(pathItem)) {
                                shouldUpdate = true
                            }
                        }
                    }
                } else {
                    /*
                     * Update the arguments for actions when action name is updated.
                     * */
                    const index = pathFull.lastIndexOf('arguments')
                    const index2 = pathFull.lastIndexOf(1)
                    if (index !== -1 && index2 != -1 && (index - index2 === 1)) {
                        const pathParentCallExpression = pathFull.setSize(pathFull.count() - index - 1)
                        const calleeName = stateitemNew.getIn(pathParentCallExpression.push('callee', 'name'))
                        if (calleeName === 'Action') {
                            const pathArgument1 = pathParentCallExpression.push('arguments', 1, 'value')
                            const argument1 = stateitemNew.getIn(pathArgument1.toJS())
                            const pathAction = ['_action', argument1]
                            const actionDict = Immutable.fromJS(DEFAULT_OPTION_CHAINS).getIn(pathAction).toJS()
                            const objectExpression = getObjectExpression(actionDict)

                            stateitemNew = stateitemNew.updateIn(pathParentCallExpression.push('arguments', 2).toJS(), val=>objectExpression)
                        }
                    }
                }
            }

            if (operation === 'INSERT') {
                const lastIndex = pathFull.last() + 1
                const pathNew = pathFull.pop()
                const valueP = stateitem.getIn(pathNew.toJS())

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
                    stateitemNew = stateitem.updateIn(pathElse.toJS(), val=>Immutable.fromJS({
                        type: "BlockStatement",
                        body: [value],
                    }))
                } else {
                    stateitemNew = stateitem.updateIn(pathNew.toJS(), list=>list.splice(lastIndex, 0, value))
                }
            }
            if (operation === 'DELETE') {
                const lastIndex = pathFull.last()
                const pathNew = pathFull.pop()
                stateitemNew = stateitem.updateIn(pathNew.toJS(), list=>list.delete(lastIndex))
            }

            /* Add logical AND operation in TEST block of IFSTATEMENT.
             */
            if (operation === 'UPDATE_LOGICAL_AND') {
                const test = stateitem.getIn(pathFull.toJS())
                value.right = test.toJS()
                stateitemNew = stateitem.updateIn(pathFull.toJS(), val=>value)
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
                    const right = stateitem.getIn(pathNew.push('right').toJS())
                    stateitemNew = stateitem.updateIn(pathNew.toJS(), val=>right)
                } else if (lastIndex === 'right') {
                    const left = stateitem.getIn(pathNew.push('left').toJS())
                    stateitemNew = stateitem.updateIn(pathNew.toJS(), val=>left)
                } else {
                    // We shouldn't reach here normally.
                    return state
                }
            }

            let stateitemObj = stateitemNew.toJS()
            stateitemObj.code = getCode(stateitemObj.code_ast)
            const stateNew = state.set(index, stateitemObj)
            return stateNew
        }

        default:
            return state
    }
}
