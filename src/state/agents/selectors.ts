import {fromJS, Map, List} from 'immutable'
import {createSelector} from 'reselect'

import {User, UserRole} from 'config/types/user'
import {getDisplayName} from 'state/customers/helpers'
import {createImmutableSelector, makeGetPlainJS} from 'utils'
import {getCurrentUser} from 'state/currentUser/selectors'
import {CurrentUser, RootState} from 'state/types'

import {Agent, Agents, AgentsState} from 'state/agents/types'
import {AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS} from './constants'

export const isHumanAgent = (agent: Map<any, any>) =>
    agent.getIn(['role', 'name'], '') !== UserRole.Bot

export const isAutomationBot = (agent: Map<any, any>) =>
    agent.getIn(['role', 'name'], '') === UserRole.Bot &&
    agent.get('email', '') === AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS

export const isHumanOrAutomationBotAgent = (agent: Map<any, any>) =>
    isHumanAgent(agent) || isAutomationBot(agent)

export const getState = (state: RootState): AgentsState =>
    state.agents || fromJS({})

export const getHumanAgents = createImmutableSelector(
    getState,
    (state: AgentsState) => {
        return ((state.get('all') as List<any>) || fromJS([])).filter(
            isHumanAgent
        ) as List<any>
    }
)

export const getHumanAgentsJS = makeGetPlainJS<User[]>(getHumanAgents)

export const getHumanAndAutomationBotAgents = createImmutableSelector(
    getState,
    (state: AgentsState) => {
        return ((state.get('all') as List<any>) || fromJS([])).filter(
            isHumanOrAutomationBotAgent
        ) as List<any>
    }
)

export const getHumanAndAutomationBotAgentsJS = makeGetPlainJS<User[]>(
    getHumanAndAutomationBotAgents
)

export const getLabelledHumanAndBotAgents = createSelector(
    getHumanAndAutomationBotAgents,
    (agents) =>
        agents.map((agent: Map<any, any>) => ({
            label: getDisplayName(agent),
            id: agent.get('id') as number,
        })) as List<any>
)

export const getLabelledHumanAndAutomationBotAgentsJS = makeGetPlainJS<
    {id: number; label: string}[]
>(getLabelledHumanAndBotAgents)

export const getOtherAgents = createSelector(
    getHumanAgents,
    getCurrentUser,
    (agents: Agents, currentUser: CurrentUser) =>
        agents.filter(
            (agent: Map<any, any> = fromJS({})) =>
                String(agent.get('id', '')) !==
                String(currentUser.get('id', ''))
        ) as Agents
)

export const getAgent = (id?: number) =>
    createSelector(getHumanAgents, (agents: Agents) => {
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
export const getAgentsIdsLocation = createSelector(
    getState,
    (state: AgentsState) =>
        (state.get('locations') as Map<any, any>) || fromJS({})
)

// Ids of agents on a specific ticket
export const getAgentsIdsOnTicket = (ticketId?: string) =>
    createSelector(getAgentsIdsLocation, (locations: Map<any, any>) => {
        if (!ticketId) {
            return fromJS([]) as List<any>
        }

        const userIds: any[] = []
        locations.forEach((objectMap: Map<any, any>, userId: Maybe<number>) => {
            const ticketIds =
                (objectMap.get('Ticket') as List<any>) || fromJS([])

            if (ticketIds.includes(parseInt(ticketId))) {
                userIds.push(userId)
            }
        })
        return fromJS(userIds) as List<any>
    })

// Agents on a specific ticket
export const getAgentsOnTicket = (ticketId?: string) =>
    createSelector(
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
    createSelector(
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
export const getAgentsIdsTypingStatus = createSelector(
    getState,
    (state: AgentsState) =>
        (state.get('typingStatuses') as Map<any, any>) || fromJS({})
)

// Ids of agents typing on a specific ticket
export const getAgentsIdsTypingStatusOnTicket = (ticketId?: string) =>
    createSelector(
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
    createSelector(
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
    createSelector(
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
    createSelector(
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
