import type { StoreConfiguration } from 'models/aiAgent/types'
import type {
    AiAgentResponse,
    PlaygroundMessage,
    TestSessionLog,
} from 'models/aiAgentPlayground/types'
import {
    AgentSkill,
    AiAgentMessageType,
    MessageType,
    TestSessionLogType,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'

import type { PlaygroundChannels } from '../components/PlaygroundChat/PlaygroundChat.types'
import { AI_AGENT_SENDER } from '../components/PlaygroundMessage/PlaygroundMessage'
import {
    shouldAiAgentResponseDisplay,
    shouldDisplayActions,
} from '../utils/playground-messages.utils'

const AI_AGENT_MESSAGE_TYPE_TO_TICKET_OUTCOME: Record<string, TicketOutcome> = {
    [AiAgentMessageType.WAIT_FOR_CLOSE_TICKET_CONFIRMATION]: TicketOutcome.WAIT,
    [AiAgentMessageType.WAIT_FOR_CUSTOMER_RESPONSE]: TicketOutcome.WAIT,
    [AiAgentMessageType.HANDOVER_TO_AGENT]: TicketOutcome.HANDOVER,
}

const getEmailChannelMessagesFromResponse = (
    aiAgentResponse: AiAgentResponse,
    storeData: StoreConfiguration,
): PlaygroundMessage[] => {
    const messages: PlaygroundMessage[] = []

    if (storeData && shouldAiAgentResponseDisplay(aiAgentResponse, storeData)) {
        messages.push({
            sender: AI_AGENT_SENDER,
            type: MessageType.MESSAGE,
            content:
                aiAgentResponse.postProcessing.htmlReply ??
                aiAgentResponse.generate.output.generated_message,
            createdDatetime: new Date().toISOString(),
            attachments: aiAgentResponse.postProcessing.attachments ?? [],
        })
    }

    if (aiAgentResponse.postProcessing.internalNote.length > 0) {
        messages.push({
            sender: AI_AGENT_SENDER,
            type: MessageType.INTERNAL_NOTE,
            content: aiAgentResponse.postProcessing.internalNote,
            createdDatetime: new Date().toISOString(),
            attachments: aiAgentResponse.postProcessing.attachments ?? [],
        })
    }

    // Add a ticket event message if outcome is also validated
    if (
        aiAgentResponse.generate.output.outcome &&
        aiAgentResponse.qa.output.validate_outcome
    ) {
        messages.push({
            sender: AI_AGENT_SENDER,
            type: MessageType.TICKET_EVENT,
            outcome: aiAgentResponse.generate.output.outcome,
            createdDatetime: new Date().toISOString(),
        })
    }

    return messages
}

const getChatChannelMessagesFromResponse = (
    aiAgentResponse: AiAgentResponse,
) => {
    const messages: PlaygroundMessage[] = []

    if (
        aiAgentResponse.postProcessing.htmlReply?.length ||
        (aiAgentResponse.qa.output.validate_generated_message &&
            aiAgentResponse.generate.output.generated_message.length)
    ) {
        messages.push({
            sender: AI_AGENT_SENDER,
            type: MessageType.MESSAGE,
            agentSkill: aiAgentResponse.postProcessing.isSalesOpportunity
                ? AgentSkill.SALES
                : AgentSkill.SUPPORT,
            content:
                aiAgentResponse.postProcessing.htmlReply ??
                aiAgentResponse.generate.output.generated_message,
            createdDatetime: new Date().toISOString(),
            attachments: aiAgentResponse.postProcessing.attachments ?? [],
        })
    }

    if (shouldDisplayActions(aiAgentResponse)) {
        messages.push({
            sender: AI_AGENT_SENDER,
            type: MessageType.MESSAGE,
            agentSkill: aiAgentResponse.postProcessing.isSalesOpportunity
                ? AgentSkill.SALES
                : AgentSkill.SUPPORT,
            content: 'Was that helpful?',
            createdDatetime: new Date().toISOString(),
        })
    }

    if (aiAgentResponse.postProcessing.internalNote.length > 0) {
        messages.push({
            sender: AI_AGENT_SENDER,
            type: MessageType.INTERNAL_NOTE,
            content: aiAgentResponse.postProcessing.internalNote,
            createdDatetime: new Date().toISOString(),
            attachments: aiAgentResponse.postProcessing.attachments ?? [],
        })
    }

    // handle chat specific outcomes different from LLM outcome
    if (
        aiAgentResponse.postProcessing.chatTicketMessageMeta
            ?.ai_agent_message_type
    ) {
        const outcome =
            AI_AGENT_MESSAGE_TYPE_TO_TICKET_OUTCOME[
                aiAgentResponse.postProcessing.chatTicketMessageMeta
                    .ai_agent_message_type
            ]

        if (outcome) {
            messages.push({
                sender: AI_AGENT_SENDER,
                type: MessageType.TICKET_EVENT,
                outcome,
                createdDatetime: new Date().toISOString(),
            })
        }
    } else {
        // when chat flow doesn't specify outcome, use LLM outcome
        if (
            aiAgentResponse.generate.output.outcome &&
            aiAgentResponse.qa.output.validate_outcome
        ) {
            messages.push({
                sender: AI_AGENT_SENDER,
                type: MessageType.TICKET_EVENT,
                outcome: aiAgentResponse.generate.output.outcome,
                createdDatetime: new Date().toISOString(),
            })
        }
    }

    return messages
}

export const handleAiAgentResponse = ({
    channel,
    aiAgentResponse,
    storeData,
}: {
    channel: PlaygroundChannels
    aiAgentResponse: AiAgentResponse
    storeData: StoreConfiguration
}) => {
    if (channel === 'email') {
        return getEmailChannelMessagesFromResponse(aiAgentResponse, storeData)
    }

    return getChatChannelMessagesFromResponse(aiAgentResponse)
}

export const handleAiAgentTestSessionLog = (log: TestSessionLog) => {
    switch (log.type) {
        case TestSessionLogType.AI_AGENT_REPLY:
            return {
                sender: AI_AGENT_SENDER,
                type: MessageType.MESSAGE as const,
                content: log.data.message,
                agentSkill: log.data.isSalesOpportunity
                    ? AgentSkill.SALES
                    : AgentSkill.SUPPORT,
                createdDatetime: log.createdDatetime,
                executionId: log.aiAgentExecutionId,
            }
        case TestSessionLogType.AI_AGENT_EXECUTION_FINISHED:
            return {
                sender: AI_AGENT_SENDER,
                type: MessageType.TICKET_EVENT as const,
                createdDatetime: log.createdDatetime,
                outcome: log.data.outcome,
            }
        default:
            return null
    }
}
