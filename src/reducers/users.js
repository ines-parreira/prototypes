import * as types from '../constants/user'
import {fromJS} from 'immutable'
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

export const usersInitial = fromJS({
    items: [],
    agents: [],  // Note both admins and 'simple' agents are considered agents.
    displayItems: [],
    sort: {
        field: 'updated_datetime',
        direction: 'desc' // can be 'asc' or 'desc'
    },
    search: {
        stringQuery: '',
        params: {}
    },
    stringQuery: '',
    loading: true,
    resp: {}
})

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

export function users(state = usersInitial, action) {
    const items = state.get('items')
    let newState = state

    switch (action.type) {

        case types.FETCH_USER_LIST_START:
            if (action.stringQuery !== undefined) {
                newState = newState.merge({
                    search: {
                        stringQuery: action.stringQuery,
                        params: action.params
                    }
                })
            }

            return newState.merge({loading: true})

        case types.FETCH_USER_LIST_SUCCESS:
            // This is a bit lame but that's the proper definition of an agent.
            if (action.roles && action.roles.length === 2 && ~action.roles.indexOf('agent') && ~action.roles.indexOf('admin')) {
                newState = newState.set('agents', fromJS(action.resp.data))
            } else {
                newState = newState.set('items', fromJS(action.resp.data))
            }

            return newState.merge({
                loading: false,
                resp: action.resp
            })

        case types.CREATE_NEW_USER_SUCCESS:
            return state.merge({
                items: items.push(fromJS(action.resp)),
                loading: false,
                resp: action.resp
            })

        case types.UPDATE_USER_SUCCESS:
            return state.setIn(['items', items.findIndex(item => item.get('id') === action.userId)], fromJS(action.resp))

        case types.DELETE_USER_SUCCESS:
            return state.merge({
                items: state.get('items').filter((item) => item.get('id') !== action.userId),
                resp: action.resp
            })

        case types.SORT_USERS: {
            return state.mergeDeep({
                sort: {
                    field: action.sortField,
                    direction: action.sortDirection
                }
            })
        }

        case types.UPDATE_LIST:
            return state.merge({
                items: action.list
            })

        default:
            return state
    }
}
