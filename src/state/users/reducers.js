import * as types from './constants'
import {fromJS} from 'immutable'

export const initialState = fromJS({
    items: [],
    agents: [],  // Note both admins and 'simple' agents are considered agents.
    _internal: {
        sort: {
            field: 'updated_datetime',
            direction: 'desc' // can be 'asc' or 'desc'
        },
        search: {
            stringQuery: '',
            params: {}
        },
        loading: {}
    }
})

export default (state = initialState, action) => {
    const items = state.get('items')
    let newState = state

    switch (action.type) {
        case types.FETCH_USER_LIST_START:
            if (action.stringQuery !== undefined) {
                newState = newState
                    .setIn(['_internal', 'search'], fromJS({
                        stringQuery: action.stringQuery,
                        params: action.params
                    }))
            }

            return newState
                .setIn(['_internal', 'loading', 'fetchList'], true)

        case types.FETCH_USER_LIST_SUCCESS:
            // This is a bit lame but that's the proper definition of an agent.
            if (action.roles && action.roles.length === 2 && ~action.roles.indexOf('agent') && ~action.roles.indexOf('admin')) {
                newState = newState.set('agents', fromJS(action.resp.data))
            } else {
                newState = newState.set('items', fromJS(action.resp.data))
            }

            return newState
                .setIn(['_internal', 'loading', 'fetchList'], false)

        case types.CREATE_NEW_USER_SUCCESS:
            return state
                .merge({
                    items: items.push(fromJS(action.resp)),
                })

        case types.UPDATE_USER_SUCCESS:
            return state
                .setIn(['items', items.findIndex(item => item.get('id') === action.userId)], fromJS(action.resp))

        case types.DELETE_USER_SUCCESS:
            return state
                .merge({
                    items: state.get('items').filter((item) => item.get('id') !== action.userId)
                })

        case types.SORT_USERS: {
            return state
                .setIn(['_internal', 'sort'], fromJS({
                    field: action.sortField,
                    direction: action.sortDirection
                }))
        }

        case types.UPDATE_LIST:
            return state
                .merge({
                    items: action.list
                })

        default:
            return state
    }
}
