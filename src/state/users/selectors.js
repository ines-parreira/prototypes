import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

import * as currentUserSelectors from '../currentUser/selectors'

export const getUsersState = state => state.users || fromJS({})

export const getLoading = createSelector(
    [getUsersState],
    state => state.getIn(['_internal', 'loading'], fromJS({}))
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = name => createSelector(
    [getLoading],
    loading => loading.get(name, false)
)

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading = state => name => isLoading(name)(state)

export const getUsers = createSelector(
    [getUsersState],
    state => state.get('items', fromJS([]))
)

export const getActiveUser = createSelector(
    [getUsersState],
    state => state.get('active') || fromJS({})
)

export const getActiveUserId = createSelector(
    [getActiveUser],
    activeUser => activeUser.get('id')
)

export const getAgents = createSelector(
    [getUsersState],
    state => state.get('agents', fromJS([]))
)

export const getAgent = id => createSelector(
    [getAgents],
    agents => {
        if (!id) {
            return fromJS({})
        }

        return agents.find(agent => agent.get('id', '').toString() === id.toString(), null, fromJS({}))
    }
)

export const makeGetAgent = state => id => getAgent(id)(state)

// Location of agents in the app (ticket, view, etc.) by their ids
export const getAgentsIdsLocation = createSelector(
    [getUsersState],
    state => state.get('agentsLocation', fromJS([]))
)

// Location of agents in the app (ticket, view, etc.)
export const getAgentsLocation = createSelector(
    [getAgentsIdsLocation, makeGetAgent],
    (locations, getUserObject) => {
        // return users objects list and filter undefined ones
        return locations.map((location) => {
            // return users objects list and filter undefined ones
            const users = location
                .get('users', fromJS([]))
                .map(getUserObject)
                .filter(user => !!user.get('id'))
            return location.set('users', users)
        })
    }
)

// Location of agents in the app (ticket, view, etc.) EXCEPT current user
export const getOtherAgentsLocation = createSelector(
    [currentUserSelectors.getCurrentUser, getAgentsLocation],
    (currentUser, locations) => {
        return locations.map((location) => {
            const users = location
                .get('users', fromJS([]))
                .filter(agent => agent.get('id', '').toString() !== currentUser.get('id', '').toString())
            return location.set('users', users)
        })
    }
)

// Ids of agents on a specific ticket
export const getAgentsIdsOnTicket = ticketId => createSelector(
    [getAgentsIdsLocation],
    (agentsLocation) => {
        if (!ticketId) {
            return fromJS([])
        }

        const agentsLocationInfo = agentsLocation.find((info) => {
            return info.get('ticket', '').toString() === ticketId.toString()
        })

        if (agentsLocationInfo) {
            return agentsLocationInfo.get('users', fromJS([]))
        }

        return fromJS([])
    }
)

// Agents on a specific ticket
export const getAgentsOnTicket = ticketId => createSelector(
    [getAgentsIdsOnTicket(ticketId), makeGetAgent],
    (agentsIds, getUserObject) => {
        if (!ticketId) {
            return fromJS([])
        }

        // return users objects list and filter undefined ones
        return agentsIds
            .map(getUserObject)
            .filter(user => !!user.get('id'))
    }
)

// Agents on a specific ticket EXCEPT current user
export const getOtherAgentsOnTicket = ticketId => createSelector(
    [currentUserSelectors.getCurrentUser, getAgentsOnTicket(ticketId)],
    (currentUser, agents) => {
        return agents.filter(agent => agent.get('id', '').toString() !== currentUser.get('id', '').toString())
    }
)

export const makeGetOtherAgentsOnTicket = state => ticketId => getOtherAgentsOnTicket(ticketId)(state)

// Location of typing agents in the app by their ids
export const getAgentsIdsTypingStatus = createSelector(
    [getUsersState],
    state => state.get('agentsTypingStatus', fromJS([]))
)

// Ids of agents typing on a specific ticket
export const getAgentsIdsTypingStatusOnTicket = ticketId => createSelector(
    [getAgentsIdsTypingStatus],
    (agentsTypingStatuses) => {
        if (!ticketId) {
            return fromJS([])
        }

        const agentsTypingStatus = agentsTypingStatuses.find((info) => {
            return info.get('ticket', '').toString() === ticketId.toString()
        })

        if (agentsTypingStatus) {
            return agentsTypingStatus.get('users', fromJS([]))
        }

        return fromJS([])
    }
)

// Agents typing on a specific ticket
export const getAgentsTypingOnTicket = ticketId => createSelector(
    [getAgentsIdsTypingStatusOnTicket(ticketId), makeGetAgent],
    (agentsIds, getUserObject) => {
        if (!ticketId) {
            return fromJS([])
        }

        // return users objects list and filter undefined ones
        return agentsIds
            .map(getUserObject)
            .filter(user => !!user.get('id'))
    }
)

// Agents typing on a specific ticket EXCEPT current user
export const getOtherAgentsTypingOnTicket = ticketId => createSelector(
    [currentUserSelectors.getCurrentUser, getAgentsTypingOnTicket(ticketId)],
    (currentUser, agents) => {
        return agents.filter(agent => agent.get('id', '').toString() !== currentUser.get('id', '').toString())
    }
)

export const isAgentTypingOnTicket = ticketId => createSelector(
    [currentUserSelectors.getCurrentUser, getAgentsTypingOnTicket(ticketId)],
    (currentUser, agents) => {
        return !!agents.find(agent => agent.get('id', '').toString() === currentUser.get('id', '').toString())
    }
)
