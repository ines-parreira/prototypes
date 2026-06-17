import type {
    AiAgentMessageType,
    PlaygroundTextMessage,
    PlaygroundTicketEventMessage,
    TestSessionLog,
} from 'models/aiAgentPlayground/types'
import {
    AgentSkill,
    MessageType,
    TestSessionLogType,
} from 'models/aiAgentPlayground/types'
import {
    AI_AGENT_SENDER,
    CUSTOMER_SENDER_FALLBACK,
} from 'pages/aiAgent/PlaygroundV2/constants'

const AI_JOURNEY_TRIGGERED_MESSAGE = 'AI Journey triggered'

export type ResolveShopperSenderName = (
    customerId?: string | null,
) => string | undefined

export const handleAiAgentTestSessionLog = (
    log: TestSessionLog,
    previousLog?: TestSessionLog,
    resolveShopperSenderName?: ResolveShopperSenderName,
) => {
    switch (log.type) {
        case TestSessionLogType.AI_AGENT_REPLY:
            let isReasoningEligible = true
            if (
                previousLog?.type === TestSessionLogType.SHOPPER_MESSAGE &&
                previousLog?.data.message === AI_JOURNEY_TRIGGERED_MESSAGE
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
                aiAgentMessageType: log.data.meta
                    ?.ai_agent_message_type as AiAgentMessageType,
                attachments: log.data.attachments,
            } satisfies PlaygroundTextMessage
        case TestSessionLogType.SHOPPER_MESSAGE:
            // System-generated trigger logs are not real shopper messages
            if (log.data.message === AI_JOURNEY_TRIGGERED_MESSAGE) {
                return null
            }

            return {
                id: log.id,
                sender:
                    resolveShopperSenderName?.(log.data.customerId) ??
                    CUSTOMER_SENDER_FALLBACK,
                type: MessageType.MESSAGE as const,
                content: log.data.message,
                createdDatetime: log.createdDatetime,
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
