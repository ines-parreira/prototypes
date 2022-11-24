import {fromJS, Map, List} from 'immutable'
import _isEqual from 'lodash/isEqual'

import {StoreAction} from '../types'
import {UserRole, User} from '../../config/types/user'
import * as currentUserConstants from '../currentUser/constants'

import * as agentsConstants from './constants'
import {AgentsState} from './types'

export const initialState: AgentsState = fromJS({
    all: [],
    pagination: [],
    locations: {},
    typingStatuses: {},
})

export default function reducer(
    state: AgentsState = initialState,
    action: StoreAction
): AgentsState {
    switch (action.type) {
        case agentsConstants.FETCH_AGENTS_PAGINATION_SUCCESS: {
            return state.set('pagination', fromJS(action.resp))
        }

        case agentsConstants.CREATE_AGENT_SUCCESS: {
            return state.update('all', (agents) =>
                (agents as List<any>).push(action.resp as User)
            )
        }

        case agentsConstants.FETCH_USER_LIST_SUCCESS: {
            let newState = state

            // This is a bit lame but that's the proper definition of an agent.
            if (_isEqual(action.roles, Object.values(UserRole))) {
                newState = newState.set(
                    'all',
                    fromJS((action.resp as {data: unknown}).data)
                )
            }

            return newState
        }

        case agentsConstants.UPDATE_AGENT_SUCCESS: {
            const agent = action.resp as Map<any, any>

            const existingAgentIndex = (
                state.get('all') as List<any>
            ).findIndex(
                (user: Map<any, any>) => user.get('id') === agent.get('id')
            )

            if (!~existingAgentIndex) {
                return state
            }

            return state.setIn(['all', existingAgentIndex], agent)
        }

        case agentsConstants.DELETE_AGENT_SUCCESS: {
            return state.update('all', (agents: List<any>) =>
                agents.filter(
                    (user: Map<any, any>) =>
                        String(user.get('id')) !== String(action.id)
                )
            )
        }

        case agentsConstants.SET_AGENTS_LOCATIONS: {
            return state.set('locations', fromJS(action.data))
        }

        case agentsConstants.SET_AGENTS_TYPING_STATUSES: {
            return state.set('typingStatuses', fromJS(action.data))
        }

        case currentUserConstants.SUBMIT_CURRENT_USER_SUCCESS: {
            const agent = fromJS((action as Record<any, any>).resp) as Map<
                any,
                any
            >

            const existingAgentIndex = (
                state.get('all') as List<any>
            ).findIndex(
                (user: Map<any, any>) => user.get('id') === agent.get('id')
            )

            if (!~existingAgentIndex) {
                return state
            }

            return state.setIn(['all', existingAgentIndex], agent)
        }

        default:
            return state
    }
}
