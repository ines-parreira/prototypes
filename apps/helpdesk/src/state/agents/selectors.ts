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

export const getAgentMessageFeedbackStatus = createSelector(
    getState,
    (state: AgentsState) => {
        return state.get('messageFeedbackStatus') as Record<
            ResourceSection,
            FeedbackStatus
        >
    },
)
