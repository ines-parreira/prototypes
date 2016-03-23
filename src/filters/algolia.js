import _ from 'lodash'

import {
    getCode, getAST, codeToKeyValueFilters,groupKeyValueFilters,
    flattenIntoFilters, keyValueFiltersToCode, GroupedFiltersToAST, ASTToGroupedFilters
} from './ast'

function removeKeyPrefix(object, prefix) {
    return _.mapKeys(object, (value, key) => {
        return key.replace(prefix, '')
    })
}

function buildAlgoliaFacetFilter(pair) {
    let [key, values] = pair
    return _.map(values, (value) => {
        return `${key}:${value}`
    })
}
function removeCallees(grouped) {
    /*
    *  Remove callee information for the current algolia translation implementation:
    *  > {'ticket.tags': {'contains': ['a', 'b']} }
    *  into
    *  > {'ticket.tags': ['a', 'b']}
    */
    const removedFrom = {}
    for (let key in grouped) {
        let calleeGroup = grouped[key]
        let listsOfValues = _.values(calleeGroup)
        removedFrom[key] = _.concat(...listsOfValues)
    }
    return removedFrom
}

function mapGroupsToAlgolia(grouped) {
    let algoliaParams = {}

    /*
    *  Special handling for ticket tags since it's handled separately by Algolia
    *  ("tagFilters" for search and "_tags" on objects)
    */

    const tagFilters = grouped['tags']
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

export function ASTToAlgoliaSearchParams(filters_ast, prefix) {
    const groupedFilters = ASTToGroupedFilters(filters_ast)
    const filtersWithoutCallees = removeCallees(groupedFilters)
    const groupedWithoutPrefix  = removeKeyPrefix(filtersWithoutCallees, prefix)
    return mapGroupsToAlgolia(groupedWithoutPrefix)
}
