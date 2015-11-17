import { ADD_RULE_START, ADD_RULE_END, RULES_REQUESTS_POSTS, RULES_RECEIVE_POSTS, ERROR_MESSAGE, RULES_UPDATE_CODE_AST } from '../constants/rule/ActionTypes'
import Immutable from 'immutable'
import reqwest from 'reqwest'
import esprima from 'esprima'
import escodegen from 'escodegen'

const initialState = Immutable.List([])

function getAst(code) {
    return esprima.parse(code)
}

export function rules(state = initialState, action) {
    switch (action.type) {
        case ADD_RULE_END:
            const rule = action.rule
            rule.code_ast = getAst(rule.code)
            return state.push(rule)

        case RULES_REQUESTS_POSTS:
            return state

        case RULES_RECEIVE_POSTS:
            const rules = action.rules.map(function(ruleItem) {
                ruleItem.code_ast = getAst(ruleItem.code)
                return ruleItem
            })

            return Immutable.List(rules)

        case RULES_UPDATE_CODE_AST:
        {
            const { index, path, value, operation } = action
            const stateitem = Immutable.fromJS(state.get(index))
            const pathFull = path.unshift('code_ast')

            let stateitemNew

            if (operation === 'UPDATE') {
                stateitemNew = stateitem.updateIn(pathFull.toJS(), val=>value)
                // When we do an update for a node, the possible choices after that
                // node should be invalided.
                // e.g. if(ticket.status == 'open'){}
                // When "status" is changed to "channel", both the "==" and "open" should
                // be invalidated.
                const length = pathFull.size
                if (length >= 3) {
                    if (pathFull.get(length - 1) === 'name' && pathFull.get(length - 2) === 'object' && pathFull.get(length - 3) === 'left') {
                        const parentPath = pathFull.pop().pop().pop()
                        if (stateitem.getIn(parentPath.push('type').toJS()) === 'BinaryExpression') {
                            const pathOperator = parentPath.push('operator')
                            const pathProperty = parentPath.push('left', 'property', 'name')
                            stateitemNew = stateitemNew.updateIn(pathOperator.toJS(), val=>'')
                            stateitemNew = stateitemNew.updateIn(pathProperty.toJS(), val=>'')
                            const pathValue = parentPath.push('right', 'value')
                            stateitemNew = stateitemNew.updateIn(pathValue.toJS(), val=>'')
                        }
                    }

                    if (pathFull.get(length - 1) === 'name' && pathFull.get(length - 2) === 'property' && pathFull.get(length - 3) === 'left') {
                        const parentPath = pathFull.pop().pop().pop()
                        if (stateitem.getIn(parentPath.push('type').toJS()) === 'BinaryExpression') {
                            const pathOperator = parentPath.push('operator')
                            stateitemNew = stateitemNew.updateIn(pathOperator.toJS(), val=>'')
                            const pathValue = parentPath.push('right', 'value')
                            stateitemNew = stateitemNew.updateIn(pathValue.toJS(), val=>'')
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
            stateitemObj.code = escodegen.generate(stateitemObj.code_ast)
            const stateNew = state.set(index, stateitemObj)
            return stateNew
        }

        default:
            return state
    }
}

export function error(state = '', action) {
    switch (action.type) {
        case ERROR_MESSAGE:
            return action.errormsg
        default:
            return state
    }
}
