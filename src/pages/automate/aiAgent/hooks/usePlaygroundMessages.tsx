import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import axios from 'axios'
import {useSubmitPlaygroundTicket} from 'models/aiAgent/queries'
import {reportError} from 'utils/errors'
import {
    MessageType,
    PlaygroundPromptMessage,
    PlaygroundMessage,
    PlaygroundTextMessage,
    isApiEligiblePlaygroundMessage,
} from 'models/aiAgentPlayground/types'
import {StoreConfiguration} from 'models/aiAgent/types'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {
    AI_AGENT_SENDER,
    GREETING_MESSAGE,
    PlaygroundGenericErrorMessage,
} from '../components/PlaygroundMessage/PlaygroundMessage'
import {
    CustomerHttpIntegrationDataMock,
    PLAYGROUND_CUSTOMER_MOCK,
} from '../constants'
import {PlaygroundChannels} from '../components/PlaygroundChat/PlaygroundChat.types'
import {
    getPlaygroundInitialMessage,
    getPlaygroundMessageMeta,
    mapPlaygroundMessagesToServerMessages,
    shouldDisplayActions,
} from '../utils/playground-messages.utils'
import {handleAiAgentResponse} from '../utils/playground-handler.utils'

export const usePlaygroundMessages = ({
    storeData,
    gorgiasDomain,
    accountId,
    httpIntegrationId,
    currentUserFirstName,
    channel,
}: {
    storeData: StoreConfiguration
    gorgiasDomain: string
    accountId: number
    httpIntegrationId: number
    currentUserFirstName?: string
    channel: PlaygroundChannels
}) => {
    const initialMessages: PlaygroundMessage[] = useMemo(
        () => [
            {
                sender: AI_AGENT_SENDER,
                type: MessageType.MESSAGE,
                content: getPlaygroundInitialMessage(
                    channel,
                    currentUserFirstName
                ),
                createdDatetime: new Date().toISOString(),
            },
        ],
        [channel, currentUserFirstName]
    )

    const [messages, setMessages] =
        useState<PlaygroundMessage[]>(initialMessages)

    const [isWaitingResponse, setIsWaitingResponse] = useState(false)

    useEffect(() => {
        setMessages(initialMessages)
        setIsWaitingResponse(false)
    }, [initialMessages])

    // We don't care what is in this object we just want to resend it to the AI Agent
    const actionSerializedStateRef = useRef<unknown>()

    const abortControllerRef = useRef<AbortController>()

    const {mutateAsync: submitPlaygroundTicket, isLoading: isSubmitting} =
        useSubmitPlaygroundTicket()

    const onNewConversation = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        actionSerializedStateRef.current = undefined
        setMessages(initialMessages)
        setIsWaitingResponse(false)
    }, [initialMessages])

    const processMessages = useCallback(
        async (
            newMessages: PlaygroundMessage[],
            {customerEmail, subject}: {customerEmail: string; subject?: string}
        ) => {
            // Simulate an async API call to process the message

            const mockContext =
                customerEmail === CustomerHttpIntegrationDataMock.address

            const emailIntegration = storeData.monitoredEmailIntegrations[0]

            // TODO: Remove in https://linear.app/gorgias/issue/AUTAI-1418/update-mechanism-to-get-customer-data
            // This should not happen because we check email integration in the parent component
            if (!emailIntegration && !mockContext) {
                throw new Error(
                    'Monitored Email Integration not found in storeConfiguration'
                )
            }

            const filteredMessages = newMessages.filter(
                isApiEligiblePlaygroundMessage
            )
            const lastMessage = filteredMessages[filteredMessages.length - 1]

            try {
                const abortController = new AbortController()
                abortControllerRef.current = abortController

                const {data: aiAgentResponse} = await submitPlaygroundTicket([
                    {
                        use_mock_context: mockContext,
                        domain: gorgiasDomain,
                        customer_email: customerEmail,
                        body_text: lastMessage.content,
                        created_datetime: lastMessage.createdDatetime,
                        from_agent: lastMessage.sender === AI_AGENT_SENDER,
                        channel,
                        // TODO: Remove in https://linear.app/gorgias/issue/AUTAI-1418/update-mechanism-to-get-customer-data
                        email_integration_id: emailIntegration?.id,
                        // TODO: add real customer data after implementing helpdesk endpoint
                        customer: PLAYGROUND_CUSTOMER_MOCK,
                        messages:
                            mapPlaygroundMessagesToServerMessages(
                                filteredMessages
                            ),
                        meta: getPlaygroundMessageMeta(lastMessage),
                        subject: subject ?? '',
                        http_integration_id: httpIntegrationId,
                        account_id: accountId,
                        _action_serialized_state:
                            actionSerializedStateRef.current,
                        _playground_options: {
                            shopName: storeData.storeName,
                        },
                    },
                    abortController,
                ])
                actionSerializedStateRef.current =
                    aiAgentResponse._action_serialized_state

                const aiAgentMessages = handleAiAgentResponse({
                    channel,
                    aiAgentResponse,
                    storeData,
                })

                if (shouldDisplayActions(aiAgentResponse)) {
                    setIsWaitingResponse(true)
                }

                setMessages((prevMessages) => {
                    // Remove the placeholder
                    const filteredMessages: PlaygroundMessage[] =
                        prevMessages.filter(
                            (message) =>
                                message.type !== MessageType.PLACEHOLDER
                        )

                    // Add the actual processed message
                    return [...filteredMessages, ...aiAgentMessages]
                })
            } catch (error) {
                // skip if request canceled
                if (axios.isCancel(error)) {
                    return
                }

                reportError(error, {
                    tags: {team: AI_AGENT_SENTRY_TEAM},
                    extra: {
                        context:
                            'Error during message submission from playground',
                        messages: newMessages,
                        accountId,
                    },
                })

                const errorMessage: PlaygroundMessage = {
                    sender: AI_AGENT_SENDER,
                    type: MessageType.ERROR,
                    content: (
                        <PlaygroundGenericErrorMessage
                            onClick={() => onNewConversation()}
                        />
                    ),
                    createdDatetime: new Date().toISOString(),
                }

                setMessages((prevMessages) => [
                    ...prevMessages.filter(
                        (message) => message.type !== MessageType.PLACEHOLDER
                    ),
                    errorMessage,
                ])
            }
        },
        [
            accountId,
            channel,
            gorgiasDomain,
            httpIntegrationId,
            onNewConversation,
            storeData,
            submitPlaygroundTicket,
        ]
    )

    const onMessageSend = useCallback(
        async (
            newMessage: PlaygroundTextMessage | PlaygroundPromptMessage,
            {customerEmail, subject}: {customerEmail: string; subject?: string}
        ) => {
            const newMessages = [...messages, newMessage]
            // Add placeholder only for real message processing as for action response is fast and we don't need it
            if (newMessage.type !== MessageType.PROMPT) {
                // Add placeholder and user message to the chat
                const placeholderMessage: PlaygroundMessage = {
                    sender: AI_AGENT_SENDER,
                    type: MessageType.PLACEHOLDER,
                    createdDatetime: new Date().toISOString(),
                }
                const greetingMessage: PlaygroundMessage = {
                    sender: AI_AGENT_SENDER,
                    type: MessageType.MESSAGE,
                    content: GREETING_MESSAGE,
                    createdDatetime: new Date().toISOString(),
                }

                const messagesToAdd =
                    channel === 'chat' && messages.length === 1
                        ? [greetingMessage, placeholderMessage]
                        : [placeholderMessage]

                newMessages.push(...messagesToAdd)
            }

            setMessages(newMessages)

            // Remove waiting state before each message send
            setIsWaitingResponse(false)

            await processMessages(newMessages, {customerEmail, subject})
        },
        [channel, messages, processMessages]
    )

    return {
        messages,
        onMessageSend,
        isMessageSending: isSubmitting,
        onNewConversation,
        isWaitingResponse,
    }
}
