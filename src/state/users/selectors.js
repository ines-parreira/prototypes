// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

import * as currentUserSelectors from '../currentUser/selectors'

import type {List, Map} from 'immutable'
import type {stateType, currentUserType, thunkActionType} from '../types'
import type {agentsType} from '../agents/types'
type ticketIdType = string

export const getUsersState = (state: stateType) => state.users || fromJS({})

export const getLoading = createSelector(
    [getUsersState],
    (state: Map<*,*>) => state.getIn(['_internal', 'loading']) || fromJS({})
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = (name: string) => createSelector(
    [getLoading],
    (loading: Map<*,*>) => loading.get(name, false)
)

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading = (state: stateType) => (name: string): boolean => isLoading(name)(state)

export const getUsers = createSelector(
    [getUsersState],
    (state: Map<*,*>) => state.get('items') || fromJS([])
)

export const getActiveUser = createSelector(
    [getUsersState],
    (state: Map<*,*>) => state.get('active') || fromJS({})
)

export const getActiveUserId = createSelector(
    [getActiveUser],
    (activeUser: Map<*,*>) => activeUser.get('id')
)

export const getActiveUserIntegrationData = createSelector(
    [getActiveUser],
    (activeUser: Map<*,*>) => activeUser.get('integrations') || fromJS([])
)

export const getActiveUserIntegrationDataByIntegrationId = (integrationId: string) => createSelector(
    [getActiveUserIntegrationData],
    (data: Map<*,*>) => data.get(String(integrationId)) || fromJS({})
)

export const getAgents = createSelector(
    [getUsersState],
    (state: Map<*,*>) => state.get('agents') || fromJS([])
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
    [getUsersState],
    (state: Map<*,*>) => state.get('agentsLocation') || fromJS({})
)

// Ids of agents on a specific ticket
export const getAgentsIdsOnTicket = (ticketId: ticketIdType) => createSelector(
    [getAgentsIdsLocation],
    (agentsLocation: Array<Map<*,*>>) => {
        if (!ticketId) {
            return fromJS([])
        }

        const userIds = []
        agentsLocation.forEach((objectMap, userId) => {
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
    (agentsIds: List<Map<*,*>>, getUserObject: (Map<*,*>) => Map<*,*>) => {
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
    [getUsersState],
    (state: Map<*,*>) => state.get('agentsTypingStatus') || fromJS({})
)

// Ids of agents typing on a specific ticket
export const getAgentsIdsTypingStatusOnTicket = (ticketId: ticketIdType) => createSelector(
    [getAgentsIdsTypingStatus],
    (agentsTypingStatuses: Array<Map<*,*>>) => {
        if (!ticketId) {
            return fromJS([])
        }

        const userIds = []
        agentsTypingStatuses.forEach((objectMap, userId) => {
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
    (agentsIds: List<Map<*,*>>, getUserObject: (Map<*,*>) => Map<*,*>) => {
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
