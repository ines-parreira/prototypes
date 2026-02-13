import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import _isEqual from 'lodash/isEqual'

import type { User } from 'config/types/user'
import { UserRole } from 'config/types/user'

import type {
    FeedbackStatus,
    ResourceSection,
} from '../../pages/tickets/detail/components/AIAgentFeedbackBar/types'
import * as currentUserConstants from '../currentUser/constants'
import type { StoreAction } from '../types'
import * as agentsConstants from './constants'
import type { AgentsState } from './types'

export type MessageFeedbackStatusAction = {
    resourceType: ResourceSection
    status: FeedbackStatus
}

export const initialState: AgentsState = fromJS({
    all: [],
    pagination: [],
    messageFeedbackStatus: {} as Record<ResourceSection, FeedbackStatus>,
})

export default function reducer(
    state: AgentsState = initialState,
    action: StoreAction,
): AgentsState {
    switch (action.type) {
        case agentsConstants.CREATE_AGENT_SUCCESS: {
            return state.update('all', (agents) =>
                (agents as List<any>).push(fromJS(action.resp)),
            )
        }

        case agentsConstants.FETCH_USER_LIST_SUCCESS: {
            let newState = state

            // This is a bit lame but that's the proper definition of an agent.
            if (_isEqual(action.roles, Object.values(UserRole))) {
                newState = newState.set(
                    'all',
                    fromJS((action.resp as { data: unknown }).data),
                )
            }

            return newState
        }

        case agentsConstants.UPDATE_AGENT_SUCCESS: {
            const agent = action.resp as User

            const existingAgentIndex = (
                state.get('all') as List<any>
            ).findIndex((user: Map<any, any>) => user.get('id') === agent.id)

            if (!~existingAgentIndex) {
                return state
            }

            return state.setIn(['all', existingAgentIndex], fromJS(agent))
        }

        case agentsConstants.DELETE_AGENT_SUCCESS: {
            return state.update('all', (agents: List<any>) =>
                agents.filter(
                    (user: Map<any, any>) =>
                        String(user.get('id')) !== String(action.id),
                ),
            )
        }

        case currentUserConstants.SUBMIT_CURRENT_USER_SUCCESS: {
            const agent = fromJS((action as Record<any, any>).resp) as Map<
                any,
                any
            >

            const existingAgentIndex = (
                state.get('all') as List<any>
            ).findIndex(
                (user: Map<any, any>) => user.get('id') === agent.get('id'),
            )

            if (!~existingAgentIndex) {
                return state
            }

            return state.setIn(['all', existingAgentIndex], agent)
        }

        case agentsConstants.SET_AGENT_FEEDBACK_MESSAGE_STATUS: {
            const { resourceType, status } =
                action.data as MessageFeedbackStatusAction
            // const feedbackStatusData = fromJS(action.data) as Map<string, unknown>;

            return state.update(
                'messageFeedbackStatus',
                (
                    messageFeedbackStatus: Record<
                        ResourceSection,
                        FeedbackStatus
                    >,
                ) => ({
                    ...messageFeedbackStatus,
                    [resourceType]: status,
                }),
            )
        }

        default:
            return state
    }
}
