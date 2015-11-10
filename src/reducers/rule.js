import { ADD_RULE_START, ADD_RULE_END, RULES_REQUESTS_POSTS, RULES_RECEIVE_POSTS, ERROR_MESSAGE, RULES_UPDATE_CODE_AST } from '../constants/rule/ActionTypes'
import Immutable from 'immutable'
import reqwest from 'reqwest'
import esprima from 'esprima'

const initialState = Immutable.List([])

function get_ast(code){
    return esprima.parse(code)
}

export function rules(state = initialState, action) {
    switch (action.type) {
        case ADD_RULE_END:
            var rule = action.rule
            rule['code_ast'] = get_ast(rule['code'])
            return state.push(rule)

        case RULES_REQUESTS_POSTS:
            return state

        case RULES_RECEIVE_POSTS:
            var rules = action.rules.map(function(rule, i){
                rule['code_ast'] = get_ast(rule['code'])
                return rule
            })
            return Immutable.List(rules)

        case RULES_UPDATE_CODE_AST:
            console.log(state)
            var path = action.path
            var index = action.index
            var rule = state[index]

        default:
            return state
    }
}

export function error(state='', action){
    switch (action.type){
        case ERROR_MESSAGE:
            return action.errormsg
        default:
            return state
    }
}
