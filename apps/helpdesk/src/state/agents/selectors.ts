import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { createSelector } from 'reselect'

import type { User } from 'config/types/user'
import { UserRole } from 'config/types/user'
import type { Agent, Agents, AgentsState } from 'state/agents/types'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getDisplayName } from 'state/customers/helpers'
import type { CurrentUser, RootState } from 'state/types'
import { createImmutableSelector, makeGetPlainJS } from 'utils'

import type {
    FeedbackStatus,
    ResourceSection,
} from '../../pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from './constants'

export const isHumanAgent = (agent: Map<any, any>) =>
    agent.getIn(['role', 'name'], '') !== UserRole.Bot

export const isGorgiasSupportAgent = (agent: Map<any, any>) =>
    agent.getIn(['role', 'name'], '') === UserRole.GorgiasAgent

export const isHumanAgentExceptGorgiasSupport = (agent: Map<any, any>) =>
    isHumanAgent(agent) && !isGorgiasSupportAgent(agent)

export const isAutomationBot = (agent: Map<any, any>) =>
    agent.getIn(['role', 'name'], '') === UserRole.Bot &&
    AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS.includes(agent.get('email', ''))

export const isHumanOrAutomationBotAgent = (agent: Map<any, any>) =>
    isHumanAgent(agent) || isAutomationBot(agent)

export const getState = (state: RootState): AgentsState =>
    state.agents || fromJS({})

export const getAllAgents = createImmutableSelector(getState, (agents) => {
    return agents.get('all') as List<any>
})

export const getAllAgentsJS = makeGetPlainJS<User[]>(getAllAgents)

export const getHumanAgents = createImmutableSelector(
    getAllAgents,
    (agents) => {
        return (agents || fromJS([])).filter(isHumanAgent) as List<any>
    },
)

export const getHumanAgentsExceptGorgiasSupport = createImmutableSelector(
    getAllAgents,
    (agents) => {
        return (agents || fromJS([])).filter(
            isHumanAgentExceptGorgiasSupport,
        ) as List<any>
    },
)

export const getHumanAgentsJS = makeGetPlainJS<User[]>(getHumanAgents)

export const getHumanAndAutomationBotAgents = createImmutableSelector(
    getAllAgents,
    (agents) => {
        return (agents || fromJS([])).filter(
            isHumanOrAutomationBotAgent,
        ) as List<any>
    },
)

export const getHumanAndAutomationBotAgentsJS = makeGetPlainJS<User[]>(
    getHumanAndAutomationBotAgents,
)

export const getAccountAdmins = createImmutableSelector(
    getHumanAgents,
    (agents) => {
        return (agents || fromJS([])).filter(
            (agent: Map<any, any>) =>
                agent.getIn(['role', 'name'], '') === UserRole.Admin,
        ) as List<any>
    },
)

export const getAccountAdminsJS = makeGetPlainJS<User[]>(getAccountAdmins)

export const getLabelledHumanAndBotAgents = createSelector(
    getHumanAndAutomationBotAgents,
    (agents) =>
        agents.map((agent: Map<any, any>) => ({
            label: getDisplayName(agent),
            id: agent.get('id') as number,
        })) as List<any>,
)

export const getFilterAgents = createSelector(
    getLabelledHumanAndBotAgents,
    (agents) =>
        agents.map((agent: Record<string, any>) => ({
            ...agent,
            value: `${agent.id}`,
        })) as List<any>,
)

export const getLabelledHumanAndAutomationBotAgentsJS = makeGetPlainJS<
    { id: number; label: string }[]
>(getLabelledHumanAndBotAgents)

export const getFilterAgentsJS =
    makeGetPlainJS<{ value: string; label: string }[]>(getFilterAgents)

export const getOtherAgents = createSelector(
    getHumanAgents,
    getCurrentUser,
    (agents: Agents, currentUser: CurrentUser) =>
        agents.filter(
            (agent: Map<any, any> = fromJS({})) =>
                String(agent.get('id', '')) !==
                    String(currentUser.get('id', '')) &&
                agent.getIn(['role', 'name'], '') !== UserRole.GorgiasAgent,
        ) as Agents,
)

export const getAgent = (id?: number) =>
    createSelector(getHumanAgents, (agents: Agents) => {
        if (!id) {
            return fromJS({}) as Agent
        }

        return (
            (agents.find(
                (agent: Map<any, any> = fromJS({})) =>
                    (agent.get('id', '') as number).toString() ===
                    id.toString(),
            ) as Map<any, any>) || fromJS({})
        )
    })

export const getAgentJS = (id?: number) =>
    createSelector(getAgent(id), (agent: Agent): User | undefined => {
        if (!agent.get('id')) {
            return undefined
        }
        return agent.toJS() as User
    })

export const makeGetAgent =
    (state: RootState) =>
    (id: number): Agent =>
        getAgent(id)(state)

// Location of agents in the app (ticket, view, etc.) by their ids
export const getAgentsIdsLocation = createSelector(
    getState,
    (state: AgentsState) =>
        (state.get('locations') as Map<any, any>) || fromJS({}),
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
            getUserObject: ReturnType<typeof makeGetAgent>,
        ) => {
            if (!ticketId) {
                return fromJS([]) as List<any>
            }

            // return users objects list and filter undefined ones
            return agentsIds
                .map(getUserObject)
                .filter(
                    (user: Map<any, any> = fromJS({})) => !!user.get('id'),
                ) as List<any>
        },
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
                    (currentUser.get('id', '') as number).toString(),
            ) as Agents
        },
    )

// Location of typing agents in the app by their ids
export const getAgentsIdsTypingStatus = createSelector(
    getState,
    (state: AgentsState) =>
        (state.get('typingStatuses') as Map<any, any>) || fromJS({}),
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
        },
    )

// Agents typing on a specific ticket
export const getAgentsTypingOnTicket = (ticketId?: string) =>
    createSelector(
        getAgentsIdsTypingStatusOnTicket(ticketId),
        makeGetAgent,
        (
            agentsIds: List<any>,
            getUserObject: ReturnType<typeof makeGetAgent>,
        ) => {
            if (!ticketId) {
                return fromJS([]) as List<any>
            }

            // return users objects list and filter undefined ones
            return agentsIds
                .map(getUserObject)
                .filter(
                    (user: Map<any, any> = fromJS({})) => !!user.get('id'),
                ) as List<any>
        },
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
                    (currentUser.get('id', '') as number).toString(),
            ) as Agents
        },
    )
export const isAgentTypingOnTicket = (ticketId?: string) =>
    createSelector(
        getCurrentUser,
        getAgentsTypingOnTicket(ticketId),
        (currentUser: CurrentUser, agents: Agents) => {
            return !!agents.find(
                (agent: Map<any, any> = fromJS({})) =>
                    (agent.get('id', '') as number).toString() ===
                    (currentUser.get('id', '') as number).toString(),
            )
        },
    )

export const getAgentMessageFeedbackStatus = createSelector(
    getState,
    (state: AgentsState) => {
        return state.get('messageFeedbackStatus') as Record<
            ResourceSection,
            FeedbackStatus
        >
    },
)
