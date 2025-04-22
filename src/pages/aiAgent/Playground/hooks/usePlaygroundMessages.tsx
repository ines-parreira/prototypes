import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import axios from 'axios'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useSubmitPlaygroundTicket } from 'models/aiAgent/queries'
import { StoreConfiguration } from 'models/aiAgent/types'
import {
    isApiEligiblePlaygroundMessage,
    MessageType,
    PlaygroundMessage,
    PlaygroundPromptMessage,
    PlaygroundTextMessage,
} from 'models/aiAgentPlayground/types'
import { reportError } from 'utils/errors'

import { PLAYGROUND_CUSTOMER_MOCK } from '../../constants'
import {
    PlaygroundChannelAvailability,
    PlaygroundChannels,
} from '../components/PlaygroundChat/PlaygroundChat.types'
import {
    AI_AGENT_SENDER,
    GREETING_MESSAGE,
    PlaygroundGenericErrorMessage,
} from '../components/PlaygroundMessage/PlaygroundMessage'
import { PlaygroundCustomer } from '../types'
import { handleAiAgentResponse } from '../utils/playground-handler.utils'
import {
    getLastShopperMessage,
    getPlaygroundInitialMessage,
    getPlaygroundMessageMeta,
    mapPlaygroundMessagesToServerMessages,
    shouldDisplayActions,
} from '../utils/playground-messages.utils'
import { getTicketCustomer } from '../utils/playground-ticket.util'

export const usePlaygroundMessages = ({
    storeData,
    gorgiasDomain,
    accountId,
    httpIntegrationId,
    currentUserFirstName,
    channel,
    channelIntegrationId,
    channelAvailability,
}: {
    storeData: StoreConfiguration
    gorgiasDomain: string
    accountId: number
    httpIntegrationId: number
    currentUserFirstName?: string
    channel: PlaygroundChannels
    channelIntegrationId?: number
    channelAvailability?: PlaygroundChannelAvailability
}) => {
    const initialMessages: PlaygroundMessage[] = useMemo(
        () => [
            {
                sender: AI_AGENT_SENDER,
                type: MessageType.MESSAGE,
                content: getPlaygroundInitialMessage(
                    channel,
                    currentUserFirstName,
                ),
                createdDatetime: new Date().toISOString(),
            },
        ],
        [channel, currentUserFirstName],
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

    const { mutateAsync: submitPlaygroundTicket, isLoading: isSubmitting } =
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
            {
                customer,
                subject,
            }: { customer: PlaygroundCustomer; subject?: string },
        ) => {
            // Simulate an async API call to process the message

            const filteredMessages = newMessages.filter(
                isApiEligiblePlaygroundMessage,
            )

            const lastMessage = getLastShopperMessage(filteredMessages)

            let messageCustomer = PLAYGROUND_CUSTOMER_MOCK
            try {
                messageCustomer = await getTicketCustomer({
                    customer_email: customer.email,
                    account_id: accountId,
                    http_integration_id: httpIntegrationId,
                })
            } catch (error) {
                reportError(error, {
                    tags: { team: SentryTeam.AI_AGENT },
                    extra: {
                        context: 'Error during get customer for playground',
                        customer,
                        accountId,
                    },
                })
            }

            try {
                const abortController = new AbortController()
                abortControllerRef.current = abortController

                const { data: aiAgentResponse } = await submitPlaygroundTicket([
                    {
                        domain: gorgiasDomain,
                        customer_email: customer.email,
                        body_text: lastMessage.content,
                        created_datetime: lastMessage.createdDatetime,
                        from_agent: lastMessage.sender === AI_AGENT_SENDER,
                        channel,
                        customer: messageCustomer,
                        messages: mapPlaygroundMessagesToServerMessages(
                            filteredMessages,
                            channel,
                        ),
                        meta: getPlaygroundMessageMeta({
                            message: lastMessage,
                            // If the only message is coming from the user, it's the first message and we should mark it as such
                            firstShopperMessage:
                                channel === 'chat' &&
                                filteredMessages.filter(
                                    (m) => m.sender !== AI_AGENT_SENDER,
                                ).length === 1,
                            channelAvailability:
                                channel === 'chat'
                                    ? channelAvailability
                                    : undefined,
                        }),
                        subject: subject ?? '',
                        http_integration_id: httpIntegrationId,
                        account_id: accountId,
                        _action_serialized_state:
                            actionSerializedStateRef.current,
                        _playground_options: {
                            shopName: storeData.storeName,
                        },
                        channel_integration_id: channelIntegrationId,
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
                                message.type !== MessageType.PLACEHOLDER,
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
                    tags: { team: SentryTeam.AI_AGENT },
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
                        (message) => message.type !== MessageType.PLACEHOLDER,
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
            channelIntegrationId,
            channelAvailability,
        ],
    )

    const onMessageSend = useCallback(
        async (
            newMessage: PlaygroundTextMessage | PlaygroundPromptMessage,
            {
                customer,
                subject,
            }: { customer: PlaygroundCustomer; subject?: string },
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

            await processMessages(newMessages, { customer, subject })
        },
        [channel, messages, processMessages],
    )

    return {
        messages,
        onMessageSend,
        isMessageSending: isSubmitting,
        onNewConversation,
        isWaitingResponse,
    }
}
