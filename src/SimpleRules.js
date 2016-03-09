import { _ } from 'lodash'
import { getCode, getAST } from './reducers/rule'
import { TICKET_ASSIGNEE, TICKET_STATUS, TICKET_TAGS } from './constants'

/*
SimpleRules are always of the following format 

{
    "ticket.tags": ["a", "b"],
    "ticket.assignee_user_id": 1,
}

as a result they are ANDed together into code:

contains(ticket.tags, 'a') && contains(ticket.tags, 'b') && eq(ticket.assignee_user_id, 1);

and the same the other way around

*/


const singleSelects = [
    TICKET_ASSIGNEE,
    TICKET_STATUS,
]

const multiSelects = [
    TICKET_TAGS
]

function getRuleFunction(key) {
    if (_.includes(singleSelects, key)) {
        return 'eq'
    }
    if (_.includes(multiSelects, key)) {
        return 'contains'
    }
}

const AND_JOIN = ' && '


function getRuleCode(simpleRule) {
    let [key, val] = simpleRule
    const func = getRuleFunction(key)

    if (!func) {
        return console.error("No  comparison function associated with", key)
    }

    val = JSON.stringify(val)
    return `${func}(${key}, ${val})`
}

export function simpleRulesToCode(rules) {
    /*
    *  Turn the
    *  > {ticket.tags: ['a', 'b']}
    *  rules into an expression like
    *  > contains(ticket.tags, 'a') && contains(ticket.tags, 'b')
    */
    if (_.isEmpty(rules)) {
        return ""
    }
    const flatRules = []

    // For..of seems to break for keys with dots in them
    for (let key in rules) {
        let vals = rules[key]
        vals = _.isArray(vals) ? vals : [vals]
        for (let val of vals) {
            flatRules.push([key, val])
        }
    }

    const expressions = _.map(flatRules, getRuleCode)
    return expressions.join(AND_JOIN)
}


function parseMemberArgument(node) {
    return node.type === "Literal" ? node.value : getCode(node)
}

export function codeToSimpleRules(code) {
    /*
    *  Turn the
    *  > contains(ticket.tags, 'a') && contains(ticket.tags, 'b')
    *  expression into rules like
    *  > {ticket.tags: ['a', 'b']}
    */
    if (!code) {
        return {}
    }

    const expressions = code.split(AND_JOIN)
    const flatRules = _.map(expressions, (expression) => {
        const ast = getAST(expression)
        const callArgs = ast.body[0].expression.arguments
        return _.map(callArgs, parseMemberArgument)
    })

    let simpleRules = _.groupBy(flatRules, '0')
    for (let key in simpleRules) {
        let values = _.map(simpleRules[key], '1')
        if (_.includes(singleSelects, key)) {
            // Make sure we only have one value for single-selects
            values = _.last(values)
        }
        simpleRules[key] = values
    }
    return simpleRules
}
