import { ADD_RULE_START, ADD_RULE_END, RULES_REQUESTS_POSTS, RULES_RECEIVE_POSTS, ERROR_MESSAGE, RULES_UPDATE_CODE_AST } from '../constants/rule/ActionTypes'
import Immutable from 'immutable'
import reqwest from 'reqwest'
import esprima from 'esprima'

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
            /* TODO: handle update code ast. */
            return state

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
