// @flow
import {fromJS} from 'immutable'
import _isEqual from 'lodash/isEqual'
import type {Map} from 'immutable'

import {actionType} from '../types'

import {USER_ROLES} from '../../config/user'

import * as constants from './constants.js'
import * as agentsConstants from './constants'

export const initialState = fromJS({
    all: [],
    pagination: {},
    locations: {},
    typingStatuses: {},

})

export default function reducer (state: Map<*,*> = initialState, action: actionType): Map<*,*> {
    switch (action.type) {
        case constants.FETCH_AGENTS_PAGINATION_SUCCESS: {
            return state.set('pagination', fromJS(action.resp))
        }

        case agentsConstants.CREATE_AGENT_SUCCESS: {
            return state.update('all', (agents) => agents.push(action.resp))
        }

        case agentsConstants.FETCH_USER_LIST_SUCCESS: {
            let newState = state

            // This is a bit lame but that's the proper definition of an agent.
            if (_isEqual(action.roles, USER_ROLES)) {
                newState = newState.set('all', fromJS(action.resp.data))
            }

            return newState
        }
        case agentsConstants.UPDATE_AGENT_SUCCESS: {
            const agent = action.resp

            const existingAgentIndex = state.get('all').findIndex((user) => user.get('id') === agent.get('id'))

            if (!~existingAgentIndex) {
                return state
            }

            return state.setIn(['all', existingAgentIndex], agent)
        }

        case agentsConstants.DELETE_AGENT_SUCCESS: {
            return state.update('all', (agents) => agents.filter((user) => String(user.get('id')) !== String(action.id)))
        }

        case agentsConstants.SET_AGENTS_LOCATIONS: {
            return state.set('locations', fromJS(action.data))
        }

        case agentsConstants.SET_AGENTS_TYPING_STATUSES: {
            return state.set('typingStatuses', fromJS(action.data))
        }

        default:
            return state
    }
}
