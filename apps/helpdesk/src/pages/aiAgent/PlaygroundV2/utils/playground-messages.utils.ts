import type { StoreConfiguration } from 'models/aiAgent/types'
import type {
    AiAgentResponse,
    CreatePlaygroundMessage,
    PlaygroundMessage,
    PlaygroundPromptMessage,
    PlaygroundTextMessage,
} from 'models/aiAgentPlayground/types'
import {
    AiAgentMessageType,
    isApiEligiblePlaygroundMessage,
    MessageType,
    PlaygroundPromptType,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'
import {
    AI_AGENT_SENDER,
    GREETING_MESSAGE_TEXT,
} from 'pages/aiAgent/PlaygroundV2/constants'

import {
    CustomerHttpIntegrationDataMock,
    PLAYGROUND_PROMPT_CONTENT,
} from '../../constants'
import type {
    PlaygroundChannelAvailability,
    PlaygroundChannels,
    PlaygroundFormValues,
} from '../types'

type PlaygroundMessageMeta = {
    ai_agent_message_type: string
    chat_availability?: string
}

type GetPlaygroundMessageMetaInput = {
    message: PlaygroundMessage
    firstShopperMessage?: boolean
    channelAvailability?: PlaygroundChannelAvailability
}

export const getPlaygroundMessageMeta = ({
    message,
    firstShopperMessage = false,
    channelAvailability,
}: GetPlaygroundMessageMetaInput): PlaygroundMessageMeta | undefined => {
    if (firstShopperMessage) {
        return {
            ai_agent_message_type: AiAgentMessageType.ENTRY_CUSTOMER_MESSAGE,
            chat_availability: channelAvailability,
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
        message.content === GREETING_MESSAGE_TEXT
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
    return messages.filter(isApiEligiblePlaygroundMessage).map((m, index) => {
        return {
            bodyText: m.content,
            fromAgent: m.sender === AI_AGENT_SENDER,
            createdDatetime: m.createdDatetime,
            // We should annotate the first message as an entry message
            meta: getPlaygroundMessageMeta({
                message: m,
                firstShopperMessage: channel === 'chat' && index === 0,
            }),
        }
    })
}

export const mapPlaygroundFormValuesToMessage = (
    formValues: PlaygroundFormValues,
): PlaygroundTextMessage => {
    return {
        id: '00000000-0000-0000-0000-000000000000',
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
