import { StoreConfiguration } from 'models/aiAgent/types'
import {
    AiAgentMessageType,
    AiAgentResponse,
    CreatePlaygroundMessage,
    isApiEligiblePlaygroundMessage,
    MessageType,
    PlaygroundMessage,
    PlaygroundPromptMessage,
    PlaygroundPromptType,
    PlaygroundTextMessage,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'

import {
    PlaygroundChannels,
    PlaygroundFormValues,
} from '../components/PlaygroundChat/PlaygroundChat.types'
import {
    AI_AGENT_SENDER,
    GREETING_MESSAGE,
} from '../components/PlaygroundMessage/PlaygroundMessage'
import {
    CustomerHttpIntegrationDataMock,
    PLAYGROUND_PROMPT_CONTENT,
} from '../constants'

export const getPlaygroundMessageMeta = (
    message: PlaygroundMessage,
    firstShopperMessage = false,
) => {
    if (firstShopperMessage) {
        return {
            ai_agent_message_type: AiAgentMessageType.ENTRY_CUSTOMER_MESSAGE,
        }
    }
    if (message.type === MessageType.PROMPT) {
        return {
            ai_agent_message_type:
                message.prompt === PlaygroundPromptType.RELEVANT_RESPONSE
                    ? 'ai_agent_response_relevant_true'
                    : 'ai_agent_response_relevant_false',
        }
    }

    if (
        message.type === MessageType.MESSAGE &&
        message.content === GREETING_MESSAGE
    ) {
        return {
            ai_agent_message_type: AiAgentMessageType.GREETING,
        }
    }
}

export const mapPlaygroundMessagesToServerMessages = (
    messages: PlaygroundMessage[],
    channel: PlaygroundChannels,
): CreatePlaygroundMessage[] => {
    return messages
        .slice(1) // remove initial message
        .filter(isApiEligiblePlaygroundMessage)
        .map((m, index) => {
            return {
                bodyText: m.content,
                fromAgent: m.sender === AI_AGENT_SENDER,
                createdDatetime: m.createdDatetime,
                // We should annotate the first message as an entry message
                meta: getPlaygroundMessageMeta(
                    m,
                    channel === 'chat' && index === 0,
                ),
            }
        })
}

export const mapPlaygroundFormValuesToMessage = (
    formValues: PlaygroundFormValues,
): PlaygroundTextMessage => {
    return {
        sender: formValues.customer.name ?? formValues.customer.email,
        type: MessageType.MESSAGE,
        content: formValues.message,
        createdDatetime: new Date().toISOString(),
    }
}

export const mapPlaygroundPromptToMessage = (
    prompt: PlaygroundPromptType,
    sender?: string,
): PlaygroundPromptMessage => {
    return {
        sender: sender ?? CustomerHttpIntegrationDataMock.name,
        type: MessageType.PROMPT,
        createdDatetime: new Date().toISOString(),
        content: PLAYGROUND_PROMPT_CONTENT[prompt],
        prompt,
    }
}

export const shouldDisplayActions = (aiAgentResponse: AiAgentResponse) => {
    return (
        aiAgentResponse.postProcessing.chatTicketMessageMeta
            ?.ai_agent_message_type ===
        AiAgentMessageType.WAIT_FOR_CLOSE_TICKET_CONFIRMATION
    )
}

export const getLastShopperMessage = (
    messages: (PlaygroundTextMessage | PlaygroundPromptMessage)[],
): PlaygroundTextMessage | PlaygroundPromptMessage => {
    return (
        [...messages].reverse().find((m) => m.sender !== AI_AGENT_SENDER) ??
        messages[messages.length - 1]
    )
}

export const shouldAiAgentResponseDisplay = (
    aiAgentResponse: AiAgentResponse,
    storeData: StoreConfiguration,
) => {
    const isHandover =
        aiAgentResponse.generate.output.outcome === TicketOutcome.HANDOVER
    const isSilentHandover = storeData.silentHandover
    const hasHtmlReply = aiAgentResponse.postProcessing.htmlReply

    return (
        aiAgentResponse.qa.output.validate_generated_message &&
        ((isHandover && !isSilentHandover) || (!isHandover && hasHtmlReply))
    )
}

export const getPlaygroundInitialMessage = (
    channel: PlaygroundChannels,
    currentUserFirstName?: string,
) => {
    switch (channel) {
        case 'chat':
            return `Hi${
                currentUserFirstName ? ` ${currentUserFirstName}` : ''
            }<br/><br/>Welcome to your AI Agent test area.<br/><br/>You can use this to send messages to AI Agent in the same way your customers do and test how it responds. If you want to improve the response, you can edit your resources and re-test your question.`
        default:
            return `Hi${
                currentUserFirstName ? ` ${currentUserFirstName}` : ''
            }!<br/><br/>Welcome to your AI Agent test area.<br/><br/>Your test area lets you search for an <b>existing customer</b> to see how your AI Agent would respond <b>based on your resources and the customer’s order history.</b><br/><br/>If you want to improve the response, you can edit your resources and re-test your question.`
    }
}
