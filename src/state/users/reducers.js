// @flow
import {fromJS} from 'immutable'
import _isEqual from 'lodash/isEqual'

import {isAgent} from '../../utils'

import * as constants from './constants'
import * as agentsConstants from '../agents/constants'
import * as ticketConstants from '../ticket/constants'
import * as viewsConstants from '../views/constants'

import type {Map} from 'immutable'
import type {actionType} from '../types'

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
    agentsLocation: {},
    agentsTypingStatus: {},
    _internal: {
        loading: {
            history: false,
            active: false,
            submitUser: false,
            merge: false
        }
    }
})

export default (state: Map<*,*> = initialState, action: actionType): Map<*,*> => {
    const items = state.get('items', fromJS([]))

    switch (action.type) {
        case viewsConstants.FETCH_LIST_VIEW_SUCCESS: {
            if (action.viewType !== 'customer-list') {
                return state
            }

            const payload = action.data

            return state.set('items', fromJS(payload.data))
        }

        // THE FOLLOWING FUNCTION IS ONLY USED TO FETCH AGENTS AND ADMINS
        case constants.FETCH_USER_LIST_SUCCESS: {
            let newState = state

            // This is a bit lame but that's the proper definition of an agent.
            if (_isEqual(action.roles, ['agent', 'admin'])) {
                newState = newState.set('agents', fromJS(action.resp.data))
            }

            return newState
        }

        case constants.FETCH_USER_START: {
            return state
                .set('active', fromJS({}))
                .setIn(['_internal', 'loading', 'active'], true)
        }

        case constants.FETCH_USER_SUCCESS: {
            return state
                .set('active', fromJS(action.resp))
                .setIn(['_internal', 'loading', 'active'], false)
        }

        case constants.FETCH_USER_ERROR: {
            return state.setIn(['_internal', 'loading', 'active'], false)
        }

        case constants.SUBMIT_USER_START: {
            return state.setIn(['_internal', 'loading', 'submitUser'], true)
        }

        case constants.SUBMIT_USER_SUCCESS: {
            let newState = state
            const responseUser = fromJS(action.resp)

            if (action.isUpdate) {
                const userId = responseUser.get('id')

                // if updated user is in current items list, update it
                newState = newState.set('items',
                    items.set(items.findIndex(item => item.get('id') === userId), responseUser)
                )

                // if updated user is the active one, update the active one
                if (userId === state.getIn(['active', 'id'])) {
                    newState = newState.set('active', responseUser)
                }
            }

            const existingAgentIndex = newState.get('agents')
                .findIndex(user => user.get('id') === responseUser.get('id'))

            // if is an agent, add/update in list of agents
            if (isAgent(responseUser)) {
                if (~existingAgentIndex) {
                    newState = newState.setIn(['agents', existingAgentIndex], responseUser)
                } else {
                    newState = newState.update('agents', agents => agents.push(responseUser))
                }
            } else {
                // otherwise remove him
                if (~existingAgentIndex) {
                    newState = newState.update('agents', (agents) => {
                        return agents.filter(user => user.get('id') !== responseUser.get('id'))
                    })
                }
            }

            return newState.setIn(['_internal', 'loading', 'submitUser'], false)
        }

        case constants.SUBMIT_USER_ERROR: {
            return state.setIn(['_internal', 'loading', 'submitUser'], false)
        }

        case constants.DELETE_USER_SUCCESS: {
            return state
                .merge({
                    items: state.get('items').filter(item => item.get('id') !== action.userId),
                    agents: state.get('agents').filter(item => item.get('id') !== action.userId)
                })
        }

        case constants.FETCH_USER_HISTORY_START: {
            return state
                .setIn(['userHistory', 'triedLoading'], true)
                .setIn(['_internal', 'loading', 'history'], true)
        }

        case constants.FETCH_USER_HISTORY_SUCCESS: {
            const hasHistory = action.resp.meta.item_count > 1

            return state
                .setIn(['userHistory', 'tickets'], fromJS(action.resp.data))
                .setIn(['_internal', 'loading', 'history'], false)
                .setIn(['userHistory', 'hasHistory'], hasHistory)
        }

        case ticketConstants.CLEAR_TICKET:
        case constants.FETCH_USER_HISTORY_ERROR: {
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

        case constants.CLEAR_USER: {
            return state.set('active', fromJS({}))
        }

        case viewsConstants.BULK_DELETE_SUCCESS: {
            if (action.viewType !== 'customer-list') {
                return state
            }

            const newItems = state
                .get('items', fromJS([]))
                .filter(item => !action.ids.includes(item.get('id')))

            return state.set('items', newItems)
        }

        case constants.MERGE_USERS_START: {
            return state.setIn(['_internal', 'loading', 'merge'], true)
        }

        case constants.MERGE_USERS_ERROR:
        case constants.MERGE_USERS_SUCCESS: {
            let newState = state.setIn(['_internal', 'loading', 'merge'], false)

            if (action.resp && state.getIn(['active', 'id']) === action.resp.id) {
                newState = newState.set('active', fromJS(action.resp))
            }

            return newState
        }

        case constants.SET_AGENTS_LOCATION: {
            return state.set('agentsLocation', fromJS(action.data))
        }

        case constants.SET_AGENTS_TYPING_STATUS: {
            return state.set('agentsTypingStatus', fromJS(action.data))
        }

        case agentsConstants.CREATE_AGENT_SUCCESS: {
            return state.update('agents', agents => agents.push(action.resp))
        }

        case agentsConstants.UPDATE_AGENT_SUCCESS: {
            const agent = action.resp

            const existingAgentIndex = state.get('agents').findIndex(user => user.get('id') === agent.get('id'))

            if (!~existingAgentIndex) {
                return state
            }

            return state.setIn(['agents', existingAgentIndex], agent)
        }

        case agentsConstants.DELETE_AGENT_SUCCESS: {
            return state.update('agents', agents => agents.filter(user => String(user.get('id')) !== String(action.id)))
        }

        default:
            return state
    }
}
