import * as types from './constants'
import * as ticketTypes from '../ticket/constants'
import * as viewsTypes from '../views/constants'
import {fromJS} from 'immutable'

export const initialState = fromJS({
    active: {},
    items: [],
    agents: [],  // Note both admins and 'simple' agents are considered agents.
    userHistory: {
        triedLoading: false,
        hasHistory: false,
        tickets: [],
        events: []
    },
    _internal: {
        loading: {
            history: false,
            active: false,
            submitUser: false
        }
    }
})

export default (state = initialState, action) => {
    const items = state.get('items')

    switch (action.type) {
        case viewsTypes.FETCH_LIST_VIEW_SUCCESS: {
            if (action.viewType !== 'user-list') {
                return state
            }

            const payload = action.data

            return state.set('items', fromJS(payload.data))
        }

        // THE FOLLOWING FUNCTION IS ONLY USED TO FETCH AGENTS AND ADMINS
        case types.FETCH_USER_LIST_SUCCESS: {
            let newState = state

            // This is a bit lame but that's the proper definition of an agent.
            if (action.roles && action.roles.includes('agent') && action.roles.includes('admin')) {
                newState = newState.set('agents', fromJS(action.resp.data))
            }

            return newState
        }

        case types.FETCH_USER_START: {
            return state.setIn(['_internal', 'loading', 'active'], true)
        }

        case types.FETCH_USER_SUCCESS: {
            return state
                .set('active', fromJS(action.resp))
                .setIn(['_internal', 'loading', 'active'], false)
        }

        case types.FETCH_USER_ERROR: {
            return state.setIn(['_internal', 'loading', 'active'], false)
        }

        case types.SUBMIT_USER_START: {
            return state.setIn(['_internal', 'loading', 'submitUser'], true)
        }

        case types.SUBMIT_USER_ERROR: {
            return state.setIn(['_internal', 'loading', 'submitUser'], false)
        }

        case types.SUBMIT_USER_SUCCESS: {
            let newState = state

            if (action.isUpdate) {
                const responseUser = fromJS(action.resp)
                newState = newState
                    .setIn(['items', items.findIndex(item => item.get('id') === action.userId)], responseUser)

                if (action.userId === state.getIn(['active', 'id'])) {
                    newState = newState.set('active', responseUser)
                }
            }

            return newState.setIn(['_internal', 'loading', 'submitUser'], false)
        }

        case types.DELETE_USER_SUCCESS: {
            return state
                .merge({
                    items: state.get('items').filter((item) => item.get('id') !== action.userId)
                })
        }

        case types.FETCH_USER_HISTORY_START: {
            return state
                .setIn(['userHistory', 'triedLoading'], true)
                .setIn(['_internal', 'loading', 'history'], true)
        }

        case types.FETCH_USER_HISTORY_SUCCESS: {
            const hasHistory = action.resp.meta.item_count > 1

            return state
                .setIn(['userHistory', 'tickets'], fromJS(action.resp.data))
                .setIn(['_internal', 'loading', 'history'], false)
                .setIn(['userHistory', 'hasHistory'], hasHistory)
        }

        case ticketTypes.CLEAR_TICKET:
        case types.FETCH_USER_HISTORY_ERROR: {
            let newState = state
                .setIn(['_internal', 'loading', 'history'], false)
                .setIn(['userHistory', 'triedLoading'], false)

            if (!action.shouldDisplayHistoryOnNextPage) {
                newState = newState
                    .setIn(['userHistory', 'tickets'], fromJS({}))
                    .setIn(['userHistory', 'hasHistory'], false)
            }

            return newState
        }

        case types.CLEAR_USER: {
            return state.set('active', fromJS({}))
        }

        case viewsTypes.BULK_DELETE_SUCCESS: {
            if (action.viewType !== 'user-list') {
                return state
            }

            const newItems = state
                .get('items', fromJS([]))
                .filter(item => !action.ids.includes(item.get('id')))

            return state.set('items', newItems)
        }

        default:
            return state
    }
}
