import {StoreConfiguration} from 'models/aiAgent/types'
import {
    AiAgentMessageType,
    AiAgentResponse,
    MessageType,
    PlaygroundMessage,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'

import {PlaygroundChannels} from '../components/PlaygroundChat/PlaygroundChat.types'
import {AI_AGENT_SENDER} from '../components/PlaygroundMessage/PlaygroundMessage'
import {
    shouldAiAgentResponseDisplay,
    shouldDisplayActions,
} from './playground-messages.utils'

const AI_AGENT_MESSAGE_TYPE_TO_TICKET_OUTCOME: Record<string, TicketOutcome> = {
    [AiAgentMessageType.WAIT_FOR_CLOSE_TICKET_CONFIRMATION]: TicketOutcome.WAIT,
    [AiAgentMessageType.WAIT_FOR_CUSTOMER_RESPONSE]: TicketOutcome.WAIT,
    [AiAgentMessageType.HANDOVER_TO_AGENT]: TicketOutcome.HANDOVER,
}

const getEmailChannelMessagesFromResponse = (
    aiAgentResponse: AiAgentResponse,
    storeData: StoreConfiguration
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
        })
    }

    if (aiAgentResponse.postProcessing.internalNote.length > 0) {
        messages.push({
            sender: AI_AGENT_SENDER,
            type: MessageType.INTERNAL_NOTE,
            content: aiAgentResponse.postProcessing.internalNote,
            createdDatetime: new Date().toISOString(),
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
    aiAgentResponse: AiAgentResponse
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
            content:
                aiAgentResponse.postProcessing.htmlReply ??
                aiAgentResponse.generate.output.generated_message,
            createdDatetime: new Date().toISOString(),
        })
    }

    if (shouldDisplayActions(aiAgentResponse)) {
        messages.push({
            sender: AI_AGENT_SENDER,
            type: MessageType.MESSAGE,
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
