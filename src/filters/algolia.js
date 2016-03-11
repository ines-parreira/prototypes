import { _ } from 'lodash'
import algoliasearch from 'algoliasearch'

import { getCode, codeToKeyValuePairs, groupKeyValuePairs } from './ast'
import { ALGOLIA_APP_NAME, ALGOLIA_SEARCH_KEY, GORGIAS_DEV_TICKETS_INDEX } from '../constants'

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
    const code = getCode(filters_ast)
    const pairs = codeToKeyValuePairs(code)
    const grouped  = groupKeyValuePairs(pairs)
    const groupedWithoutPrefix  = removeKeyPrefix(grouped, prefix)
    return mapGroupsToAlgolia(groupedWithoutPrefix)
}

export const algoliaClient = algoliasearch(ALGOLIA_APP_NAME, ALGOLIA_SEARCH_KEY)

// TODO: Load the correct index for dev/prod and the specific account
export const ticketsIndex = algoliaClient.initIndex(GORGIAS_DEV_TICKETS_INDEX)
