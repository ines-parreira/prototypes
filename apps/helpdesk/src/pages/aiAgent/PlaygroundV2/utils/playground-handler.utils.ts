import type {
    PlaygroundTextMessage,
    PlaygroundTicketEventMessage,
    TestSessionLog,
} from 'models/aiAgentPlayground/types'
import {
    AgentSkill,
    MessageType,
    TestSessionLogType,
} from 'models/aiAgentPlayground/types'
import { AI_AGENT_SENDER } from 'pages/aiAgent/PlaygroundV2/constants'

export const handleAiAgentTestSessionLog = (
    log: TestSessionLog,
    previousLog?: TestSessionLog,
) => {
    switch (log.type) {
        case TestSessionLogType.AI_AGENT_REPLY:
            let isReasoningEligible = true
            if (
                previousLog?.type === TestSessionLogType.SHOPPER_MESSAGE &&
                previousLog?.data.message === 'AI Journey triggered'
            ) {
                isReasoningEligible = false
            }

            return {
                id: log.id,
                sender: AI_AGENT_SENDER,
                type: MessageType.MESSAGE as const,
                content: log.data.message,
                agentSkill: log.data.isSalesOpportunity
                    ? AgentSkill.SALES
                    : AgentSkill.SUPPORT,
                createdDatetime: log.createdDatetime,
                executionId: log.aiAgentExecutionId,
                isReasoningEligible,
            } satisfies PlaygroundTextMessage
        case TestSessionLogType.AI_AGENT_EXECUTION_FINISHED:
            return {
                sender: AI_AGENT_SENDER,
                type: MessageType.TICKET_EVENT as const,
                createdDatetime: log.createdDatetime,
                outcome: log.data.outcome,
            } satisfies PlaygroundTicketEventMessage
        default:
            return null
    }
}
