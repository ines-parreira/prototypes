// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'
import {createImmutableSelector} from '../../utils'

import * as currentUserSelectors from '../currentUser/selectors'

// types
import type {currentUserType, stateType, thunkActionType} from '../types'
import type {agentsType} from './types'
import type {List, Map} from 'immutable'

type ticketIdType = string

export const getState = (state: stateType) => state.agents || fromJS({})

export const getPaginatedAgents = createImmutableSelector(
    [getState],
    state => state.getIn(['pagination', 'data']) || fromJS([])
)

export const getPagination = createImmutableSelector(
    [getState],
    state => state.getIn(['pagination', 'meta']) || fromJS({})
)

export const getAgents = createImmutableSelector(
    [getState],
    state => state.get('all') || fromJS([])
)

export const getOtherAgents = createSelector(
    [getAgents, currentUserSelectors.getCurrentUser],
    (agents: List<*>, currentUser: currentUserType) => agents.filter((agent) => String(agent.get('id', '')) !== String(currentUser.get('id', '')))
)

export const getAgent = (id: number) => createSelector(
    [getAgents],
    (agents: agentsType) => {
        if (!id) {
            return fromJS({})
        }

        return agents.find((agent) => agent.get('id', '').toString() === id.toString()) || fromJS({})
    }
)

export const makeGetAgent = (state: stateType) => (id: number): Map<*,*> => getAgent(id)(state)

// Location of agents in the app (ticket, view, etc.) by their ids
export const getAgentsIdsLocation = createSelector(
    [getState],
    (state: Map<*, *>) => state.get('locations') || fromJS({})
)

// Ids of agents on a specific ticket
export const getAgentsIdsOnTicket = (ticketId: ticketIdType) => createSelector(
    [getAgentsIdsLocation],
    (locations: Array<Map<*, *>>) => {
        if (!ticketId) {
            return fromJS([])
        }

        const userIds = []
        locations.forEach((objectMap, userId) => {
            const ticketIds = objectMap.get('Ticket') || fromJS([])

            if (ticketIds.includes(parseInt(ticketId))) {
                userIds.push(userId)
            }
        })
        return fromJS(userIds)
    }
)

// Agents on a specific ticket
export const getAgentsOnTicket = (ticketId: ticketIdType) => createSelector(
    [getAgentsIdsOnTicket(ticketId), makeGetAgent],
    (agentsIds: List<Map<*, *>>, getUserObject: (Map<*, *>) => Map<*, *>) => {
        if (!ticketId) {
            return fromJS([])
        }

        // return users objects list and filter undefined ones
        return agentsIds
            .map(getUserObject)
            .filter((user) => !!user.get('id'))
    }
)

// Agents on a specific ticket EXCEPT current user
export const getOtherAgentsOnTicket = (ticketId: ticketIdType) => createSelector(
    [currentUserSelectors.getCurrentUser, getAgentsOnTicket(ticketId)],
    (currentUser: currentUserType, agents: agentsType) => {
        return agents.filter((agent) => agent.get('id', '').toString() !== currentUser.get('id', '').toString())
    }
)

export const makeGetOtherAgentsOnTicket = (state: stateType): thunkActionType => (ticketId: ticketIdType) => getOtherAgentsOnTicket(ticketId)(state)

// Location of typing agents in the app by their ids
export const getAgentsIdsTypingStatus = createSelector(
    [getState],
    (state: Map<*, *>) => state.get('typingStatuses') || fromJS({})
)

// Ids of agents typing on a specific ticket
export const getAgentsIdsTypingStatusOnTicket = (ticketId: ticketIdType) => createSelector(
    [getAgentsIdsTypingStatus],
    (typingStatuses: Array<Map<*, *>>) => {
        if (!ticketId) {
            return fromJS([])
        }

        const userIds = []
        typingStatuses.forEach((objectMap, userId) => {
            const ticketIds = objectMap.get('Ticket') || fromJS([])
            if (ticketIds.includes(parseInt(ticketId))) {
                userIds.push(userId)
            }
        })
        return fromJS(userIds)
    }
)

// Agents typing on a specific ticket
export const getAgentsTypingOnTicket = (ticketId: ticketIdType) => createSelector(
    [getAgentsIdsTypingStatusOnTicket(ticketId), makeGetAgent],
    (agentsIds: List<Map<*, *>>, getUserObject: (Map<*, *>) => Map<*, *>) => {
        if (!ticketId) {
            return fromJS([])
        }

        // return users objects list and filter undefined ones
        return agentsIds
            .map(getUserObject)
            .filter((user) => !!user.get('id'))
    }
)

// Agents typing on a specific ticket EXCEPT current user
export const getOtherAgentsTypingOnTicket = (ticketId: ticketIdType) => createSelector(
    [currentUserSelectors.getCurrentUser, getAgentsTypingOnTicket(ticketId)],
    (currentUser: currentUserType, agents: agentsType) => {
        return agents.filter((agent) => agent.get('id', '').toString() !== currentUser.get('id', '').toString())
    }
)
export const isAgentTypingOnTicket = (ticketId: ticketIdType) => createSelector(
    [currentUserSelectors.getCurrentUser, getAgentsTypingOnTicket(ticketId)],
    (currentUser: currentUserType, agents: agentsType) => {
        return !!agents.find((agent) => agent.get('id', '').toString() === currentUser.get('id', '').toString())
    }
)
