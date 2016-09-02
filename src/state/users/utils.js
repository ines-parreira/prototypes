import _ from 'lodash'

export const USER_SEARCH_QUERY = {
    _source: ['id', 'name', 'email', 'roles'],
    query: {
        multi_match: {
            query: '',
            fuzziness: 3,
            fields: ['name', 'email']
        }
    },
    sort: {
        updated_datetime: {
            order: 'desc',
            mode: 'min'
        }
    }
}

export const USER_SEARCH_QUERY_PATH = 'query.multi_match.query'

/**
 * Build the search query from the stringQuery, params and sort data.
 *
 * @param stringQuery the text search query
 * @param sort the sorting data
 * @returns {*} the query with all parameters
 */
export function buildQuery(stringQuery, sort) {
    const sortObject = {}
    sortObject[sort.get('field')] = {
        order: sort.get('direction'),
        mode: 'min'
    }

    const query = Object.assign({}, USER_SEARCH_QUERY)
    query.sort = sortObject
    _.set(query, USER_SEARCH_QUERY_PATH, stringQuery)
    return query
}
