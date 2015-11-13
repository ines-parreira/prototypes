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
