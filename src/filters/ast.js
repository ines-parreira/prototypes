import esprima from 'esprima'
import escodegen from 'escodegen'
import { _ } from 'lodash'


export function getAST(code) {
    return esprima.parse(code)
}

export function getCode(ast) {
    return escodegen.generate(ast)
}

function parseMemberArgument(node) {
    return node.type === "Literal" ? node.value : getCode(node)
}

export function codeToKeyValuePairs(code) {
    /*
    *  Turn an expression such as
    *  > contains(ticket.tags, 'a') && contains(ticket.tags, 'b')
    *  into a list of lists such as
    *  > [ ['ticket.tags', 'a'], ['ticket.tags', 'a'] ]
    */
    if (!code) {
        return {}
    }
    const expressions = code.split(' && ')

     return _.map(expressions, (expression) => {
        const ast = getAST(expression)
        const callArgs = ast.body[0].expression.arguments
        return _.map(callArgs, parseMemberArgument)
    })
 }

export function groupKeyValuePairs(pairs) {
    /*
    *  Group key+value pairs by their key:
    *  > [ ['ticket.tags', 'a'], ['ticket.tags', 'a'] ]
    *  into 
    *  > {'ticket.tags': ['a', 'b']}
    */
    let grouped = {}

    for (let pair of pairs) {
        let [key, value] = pair
        let group = grouped[key] || []
        group.push(value)
        grouped[key] = group
    }

    return grouped
}
