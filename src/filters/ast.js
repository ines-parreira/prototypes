import esprima from 'esprima'
import escodegen from 'escodegen'
import _ from 'lodash'

const AND_JOIN = ' && '

export function getAST(code) {
    if (!_.isString(code)) {
        console.error('Not a string:', code)
    }
    return esprima.parse(code)
}

export function getCode(ast) {
    if (!_.isString(ast.type)) {
        console.error('Not an AST:', ast)
    }
    return escodegen.generate(ast)
}

function parseMemberArgument(node) {
    return node.type === 'Literal' ? node.value : getCode(node)
}


/*
*  Utility functions to convert Code AST into JS objects
*/

export function codeToFlatTriples(code) {
    /*
    *  Turn an expression such as
    *  > contains(ticket.tags, 'a') && contains(ticket.tags, 'b')
    *  into a list of lists such as
    *  > [ ['contains', 'ticket.tags', 'a'], ['contains', 'ticket.tags', 'b'] ]
    */
    if (!code) {
        return {}
    }
    const expressions = code.split(' && ')

    return _.map(expressions, (expression) => {
        const ast = getAST(expression)
        const callee = ast.body[0].expression.callee.name
        const callArgs = ast.body[0].expression.arguments
        return [callee].concat(_.map(callArgs, parseMemberArgument))
    })
}

export function groupFlatTriples(triples) {
    /*
    *  Group filter triples by their key & then their callee, from
    *  > [ ['contains', 'ticket.tags', 'a'], ['contains', 'ticket.tags', 'b'] ]
    *  into
    *  > {'ticket.tags': {'contains': ['a', 'b']} }
    */
    const filters = {}

    if (_.isEmpty(triples)) {
        return {}
    }

    for (let triple of triples) {
        const [callee, key, value] = triple

        const filtersForKey = filters[key] || {}
        filters[key] = filtersForKey

        const groupForCallee = filtersForKey[callee] || []
        filtersForKey[callee] = groupForCallee

        groupForCallee.push(value)
    }

    return filters
}


/*
*  Utility functions to convert JS objects into a Code AST
*/

export function groupedFiltersToFlatTriples(groupedFilters) {
    /*
    *  Unpack grouped filters, from
    *  > {'ticket.tags': {'contains': ['a', 'b']} }
    *  into
    *  > [ ['contains', 'ticket.tags', 'a'], ['contains', 'ticket.tags', 'b'] ]
    */
    if (_.isEmpty(groupedFilters)) {
        return []
    }
    const flatTriples = []
    // For..of seems to break for keys with dots in them
    for (let key in groupedFilters) {
        const calleeFilters = groupedFilters[key]
        for (let callee in calleeFilters) {
            let values = calleeFilters[callee]
            values = _.isArray(values) ? values : [values]
            for (let value of values) {
                flatTriples.push([callee, key, value])
            }
        }
    }
    return flatTriples
}

function getRuleCode(filterTriple) {
    let [callee, key, val] = filterTriple

    val = JSON.stringify(val)
    return `${callee}(${key}, ${val})`
}

export function flatTriplesToCode(flatTriples) {
    /*
    *  Turn filter triples such as
    *  > [ ['contains', 'ticket.tags', 'a'], ['contains', 'ticket.tags', 'b'] ]
    *  into code like
    *  > contains(ticket.tags, 'a') && contains(ticket.tags, 'b')
    */
    return _.map(flatTriples, getRuleCode).join(AND_JOIN)
}

export function groupedFiltersToAST(groupedFilters) {
    const flatTriples = groupedFiltersToFlatTriples(groupedFilters)
    const code = flatTriplesToCode(flatTriples)
    return getAST(code)
}

export function ASTToGroupedFilters(filters) {
    const triples = codeToFlatTriples(filters)
    return groupFlatTriples(triples)
}
