import _ from 'lodash'

function buildAlgoliaFacetFilter(pair) {
    const [key, values] = pair
    return _.map(values, (value) => {
        return `${key}:${value}`
    })
}

function mapGroupsToAlgolia(grouped) {
    const algoliaParams = {}

    /*
     *  Special handling for ticket tags since it's handled separately by Algolia
     *  ("tagFilters" for search and "_tags" on objects)
     */

    const tagFilters = grouped.tags
    if (!_.isEmpty(tagFilters)) {
        algoliaParams.tagFilters = tagFilters.join(',')
    }

    /*
     *  Translate
     *  > {'assignee_user.id': 12, 'status': 'new'}
     *  into the algolia format
     *  > 'assignee_user.id:12,status:new'
     */

    const facetParams = _.omit(grouped, 'tags')
    const facetFilters = _.map(_.toPairs(facetParams), buildAlgoliaFacetFilter)
    if (!_.isEmpty(facetFilters)) {
        algoliaParams.facetFilters = facetFilters.join(',')
    }

    return algoliaParams
}

function generateFilters(ast, prefix) {
    let filters = {}

    // walk the AST and populate the Algolia `filters`
    const walk = (node) => {
        switch (node.type) {
            case 'Program':
                for (const stm of node.body) {
                    walk(stm)
                }
                break
            case 'ExpressionStatement':
                walk(node.expression)
                break
            case 'CallExpression':
                // if we entered a CallExpression, we need to put this in our stack
                // then collecting arguments
                if (node.arguments.length !== 2) {
                    throw Error(`Too many arguments when calling: ${node.callee.name}(${node.arguments})`)
                }

                // we need to know if we have a negation of a filter depending on the name of the function
                let sign = ''
                if (['eq', 'contains'].indexOf(node.callee.name) !== -1) {
                    // do nothing
                } else if (['neq', 'notContains'].indexOf(node.callee.name) !== -1) {
                    sign = '-' // this is how algolia negates a filter
                } else {
                    throw Error(`Unknown function used for comparison: ${node.callee.name}`)
                }

                // we assume that the first argument always is the filter and the second one is the value
                // Ex: filter = 'ticket.tags' and value = 'refund'
                let filter = walk(node.arguments[0])

                // we need to remove the first object since algolia uses the properties of object directly to perform the filtering
                if (filter.indexOf(`${prefix}`) === 0) {
                    filter = filter.replace(`${prefix}`, '')
                }

                const value = sign + walk(node.arguments[1])

                // make sure we initialize our filter first
                if (Object.keys(filters).indexOf(filter) === -1) {
                    filters[filter] = []
                }
                filters[filter].push(value)
                break
            case 'MemberExpression':
                // Ex: ticket.assignee_user.id
                // What we need is to reconstruct our filter
                return walk(node.object) + '.' + walk(node.property)
            case 'LogicalExpression':
                // just walk the 2 parts (we always have an '&&')
                walk(node.right)
                walk(node.left)
                break
            case 'Identifier':
                return node.name
            case 'Literal':
                // Again, we assume that when we encounter a literal it's a value against which we have to check against
                // so we just return the value
                return node.value
            default:
                throw Error(`Unknown node type: ${node.type}`)
        }
        return ''
    }

    walk(ast)
    return filters
}

// Given an Esprima AST generate the Algolia search paramaters
export function AlgoliaSearchParams(ast, prefix) {
    const groupedFilters = generateFilters(ast, prefix)
    return mapGroupsToAlgolia(groupedFilters)
}
