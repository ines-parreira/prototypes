import {fromJS, Map, List} from 'immutable'
import {createSelector, Selector} from 'reselect'

import {getDisplayName} from '../customers/helpers'
import {createImmutableSelector, makeGetPlainJS} from '../../utils'
import {getCurrentUser} from '../currentUser/selectors'
import {CurrentUser, RootState} from '../types'

import {Agent, Agents, AgentsState} from './types'

export const getState = (state: RootState): AgentsState =>
    state.agents || fromJS({})

export const getPaginatedAgents: Selector<RootState, Agents> =
    createImmutableSelector<RootState, List<any>, AgentsState>(
        getState,
        (state: AgentsState) =>
            (state.getIn(['pagination']) as List<any>) || fromJS([])
    )

export const getAgents = createImmutableSelector<
    RootState,
    List<any>,
    AgentsState
>(
    getState,
    (state: AgentsState) => (state.get('all') as List<any>) || fromJS([])
)

export const getLabelledAgents = createSelector<RootState, List<any>, Agents>(
    getAgents,
    (agents) =>
        agents.map((agent: Map<any, any>) => ({
            label: getDisplayName(agent),
            id: agent.get('id') as number,
        })) as List<any>
)

export const getLabelledAgentsJS =
    makeGetPlainJS<{id: number; label: string}[]>(getLabelledAgents)

export const getOtherAgents = createSelector<
    RootState,
    Agents,
    Agents,
    CurrentUser
>(
    getAgents,
    getCurrentUser,
    (agents: Agents, currentUser: CurrentUser) =>
        agents.filter(
            (agent: Map<any, any> = fromJS({})) =>
                String(agent.get('id', '')) !==
                String(currentUser.get('id', ''))
        ) as Agents
)

export const getAgent = (id?: number) =>
    createSelector<RootState, Agent, Agents>(getAgents, (agents: Agents) => {
        if (!id) {
            return fromJS({}) as Agent
        }

        return (
            (agents.find(
                (agent: Map<any, any> = fromJS({})) =>
                    (agent.get('id', '') as number).toString() === id.toString()
            ) as Map<any, any>) || fromJS({})
        )
    })

export const makeGetAgent =
    (state: RootState) =>
    (id: number): Map<any, any> =>
        getAgent(id)(state)

// Location of agents in the app (ticket, view, etc.) by their ids
export const getAgentsIdsLocation = createSelector<
    RootState,
    Map<any, any>,
    AgentsState
>(
    getState,
    (state: AgentsState) =>
        (state.get('locations') as Map<any, any>) || fromJS({})
)

// Ids of agents on a specific ticket
export const getAgentsIdsOnTicket = (ticketId?: string) =>
    createSelector<RootState, List<any>, Map<any, any>>(
        getAgentsIdsLocation,
        (locations: Map<any, any>) => {
            if (!ticketId) {
                return fromJS([]) as List<any>
            }

            const userIds: any[] = []
            locations.forEach(
                (objectMap: Map<any, any>, userId: Maybe<number>) => {
                    const ticketIds =
                        (objectMap.get('Ticket') as List<any>) || fromJS([])

                    if (ticketIds.includes(parseInt(ticketId))) {
                        userIds.push(userId)
                    }
                }
            )
            return fromJS(userIds) as List<any>
        }
    )

// Agents on a specific ticket
export const getAgentsOnTicket = (ticketId?: string) =>
    createSelector<
        RootState,
        Agents,
        List<any>,
        ReturnType<typeof makeGetAgent>
    >(
        getAgentsIdsOnTicket(ticketId),
        makeGetAgent,
        (
            agentsIds: List<any>,
            getUserObject: ReturnType<typeof makeGetAgent>
        ) => {
            if (!ticketId) {
                return fromJS([]) as List<any>
            }

            // return users objects list and filter undefined ones
            return agentsIds
                .map(getUserObject)
                .filter(
                    (user: Map<any, any> = fromJS({})) => !!user.get('id')
                ) as List<any>
        }
    )

// Agents on a specific ticket EXCEPT current user
export const getOtherAgentsOnTicket = (ticketId?: string) =>
    createSelector<RootState, Agents, CurrentUser, Agents>(
        getCurrentUser,
        getAgentsOnTicket(ticketId),
        (currentUser: CurrentUser, agents: Agents) => {
            return agents.filter(
                (agent: Map<any, any> = fromJS({})) =>
                    (agent.get('id', '') as number).toString() !==
                    (currentUser.get('id', '') as number).toString()
            ) as Agents
        }
    )

export const makeGetOtherAgentsOnTicket =
    (state: RootState) => (ticketId: string) =>
        getOtherAgentsOnTicket(ticketId)(state)

// Location of typing agents in the app by their ids
export const getAgentsIdsTypingStatus = createSelector<
    RootState,
    Map<any, any>,
    AgentsState
>(
    getState,
    (state: AgentsState) =>
        (state.get('typingStatuses') as Map<any, any>) || fromJS({})
)

// Ids of agents typing on a specific ticket
export const getAgentsIdsTypingStatusOnTicket = (ticketId?: string) =>
    createSelector<RootState, List<any>, Map<any, any>>(
        getAgentsIdsTypingStatus,
        (typingStatuses: Map<any, any>) => {
            if (!ticketId) {
                return fromJS([]) as List<any>
            }

            const userIds: number[] = []
            typingStatuses.forEach((objectMap: Map<any, any>, userId) => {
                const ticketIds =
                    (objectMap.get('Ticket') as List<any>) || fromJS([])
                if (ticketIds.includes(parseInt(ticketId))) {
                    userIds.push(userId as number)
                }
            })
            return fromJS(userIds) as List<any>
        }
    )

// Agents typing on a specific ticket
export const getAgentsTypingOnTicket = (ticketId?: string) =>
    createSelector<
        RootState,
        List<any>,
        List<any>,
        ReturnType<typeof makeGetAgent>
    >(
        getAgentsIdsTypingStatusOnTicket(ticketId),
        makeGetAgent,
        (
            agentsIds: List<any>,
            getUserObject: ReturnType<typeof makeGetAgent>
        ) => {
            if (!ticketId) {
                return fromJS([]) as List<any>
            }

            // return users objects list and filter undefined ones
            return agentsIds
                .map(getUserObject)
                .filter(
                    (user: Map<any, any> = fromJS({})) => !!user.get('id')
                ) as List<any>
        }
    )

// Agents typing on a specific ticket EXCEPT current user
export const getOtherAgentsTypingOnTicket = (ticketId?: string) =>
    createSelector<RootState, Agents, CurrentUser, Agents>(
        getCurrentUser,
        getAgentsTypingOnTicket(ticketId),
        (currentUser: CurrentUser, agents: Agents) => {
            return agents.filter(
                (agent: Map<any, any> = fromJS({})) =>
                    (agent.get('id', '') as number).toString() !==
                    (currentUser.get('id', '') as number).toString()
            ) as Agents
        }
    )
export const isAgentTypingOnTicket = (ticketId?: string) =>
    createSelector<RootState, boolean, CurrentUser, Agents>(
        getCurrentUser,
        getAgentsTypingOnTicket(ticketId),
        (currentUser: CurrentUser, agents: Agents) => {
            return !!agents.find(
                (agent: Map<any, any> = fromJS({})) =>
                    (agent.get('id', '') as number).toString() ===
                    (currentUser.get('id', '') as number).toString()
            )
        }
    )
