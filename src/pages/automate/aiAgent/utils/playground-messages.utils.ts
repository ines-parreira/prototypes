import {StoreConfiguration} from 'models/aiAgent/types'
import {
    MessageType,
    AiAgentResponse,
    TicketOutcome,
    PlaygroundMessage,
    CreatePlaygroundMessage,
    isPlaygroundTextMessage,
    PlaygroundTextMessage,
} from 'models/aiAgentPlayground/types'
import {
    PlaygroundFormValues,
    PlaygroundChannels,
} from '../components/PlaygroundChat/PlaygroundChat.types'
import {CustomerHttpIntegrationDataMock} from '../constants'
import {AI_AGENT_SENDER} from '../components/PlaygroundMessage/PlaygroundMessage'

export const mapPlaygroundMessagesToServerMessages = (
    messages: PlaygroundMessage[]
): CreatePlaygroundMessage[] => {
    return messages
        .slice(1) // remove initial message
        .filter(isPlaygroundTextMessage)
        .map((m) => ({
            bodyText: m.content ?? '',
            fromAgent: m.sender === AI_AGENT_SENDER,
            createdDatetime: m.createdDatetime,
        }))
}

export const mapPlaygroundFormValuesToMessage = (
    formValues: PlaygroundFormValues
): PlaygroundTextMessage => {
    return {
        sender:
            formValues.customerName ??
            formValues.customerEmail ?? // email as fallback
            CustomerHttpIntegrationDataMock.name,
        type: MessageType.MESSAGE,
        content: formValues.message,
        createdDatetime: new Date().toISOString(),
    }
}

export const shouldAiAgentResponseDisplay = (
    aiAgentResponse: AiAgentResponse,
    storeData: StoreConfiguration
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
    currentUserFirstName?: string
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
