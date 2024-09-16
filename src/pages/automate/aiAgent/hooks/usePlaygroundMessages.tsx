import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import axios from 'axios'
import {useSubmitPlaygroundTicket} from 'models/aiAgent/queries'
import {reportError} from 'utils/errors'
import {
    MessageType,
    PlaygroundMessage,
    PlaygroundTextMessage,
} from 'models/aiAgentPlayground/types'
import {StoreConfiguration} from 'models/aiAgent/types'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {
    AI_AGENT_SENDER,
    PlaygroundGenericErrorMessage,
} from '../components/PlaygroundMessage/PlaygroundMessage'
import {CustomerHttpIntegrationDataMock} from '../constants'
import {PlaygroundChannels} from '../components/PlaygroundChat/PlaygroundChat.types'
import {
    getPlaygroundInitialMessage,
    mapPlaygroundMessagesToServerMessages,
    shouldAiAgentResponseDisplay,
} from '../utils/playground-messages.utils'

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

    useEffect(() => {
        setMessages(initialMessages)
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
    }, [initialMessages])

    const onMessageSend = useCallback(
        async (
            newMessage: PlaygroundTextMessage,
            {customerEmail, subject}: {customerEmail: string; subject?: string}
        ) => {
            const aiAgentMessagePlaceholder: PlaygroundMessage = {
                sender: AI_AGENT_SENDER,
                type: MessageType.PLACEHOLDER,
                createdDatetime: new Date().toISOString(),
            }
            const newMessages = [...messages, newMessage]
            setMessages([...newMessages, aiAgentMessagePlaceholder])

            const mockContext =
                customerEmail === CustomerHttpIntegrationDataMock.address

            const bodyText =
                newMessage.type === MessageType.MESSAGE
                    ? newMessage.content
                    : ''

            const emailIntegration = storeData.monitoredEmailIntegrations[0]

            // TODO: Remove in https://linear.app/gorgias/issue/AUTAI-1418/update-mechanism-to-get-customer-data
            // This should not happen because we check email integration in the parent component
            if (!emailIntegration && !mockContext) {
                throw new Error(
                    'Monitored Email Integration not found in storeConfiguration'
                )
            }

            try {
                const abortController = new AbortController()
                abortControllerRef.current = abortController

                const {data: aiAgentResponse} = await submitPlaygroundTicket([
                    {
                        use_mock_context: mockContext,
                        domain: gorgiasDomain,
                        customer_email: customerEmail,
                        body_text: bodyText,
                        created_datetime: newMessage.createdDatetime,
                        channel,
                        // TODO: Remove in https://linear.app/gorgias/issue/AUTAI-1418/update-mechanism-to-get-customer-data
                        email_integration_id: emailIntegration?.id,
                        messages:
                            mapPlaygroundMessagesToServerMessages(newMessages),
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
                const updatedMessages = newMessages

                if (
                    storeData &&
                    shouldAiAgentResponseDisplay(aiAgentResponse, storeData)
                ) {
                    updatedMessages.push({
                        sender: AI_AGENT_SENDER,
                        type: MessageType.MESSAGE,
                        content:
                            aiAgentResponse.postProcessing.htmlReply ??
                            aiAgentResponse.generate.output.generated_message,
                        createdDatetime: new Date().toISOString(),
                    })
                }

                if (aiAgentResponse.postProcessing.internalNote.length > 0) {
                    updatedMessages.push({
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
                    updatedMessages.push({
                        sender: AI_AGENT_SENDER,
                        type: MessageType.TICKET_EVENT,
                        outcome: aiAgentResponse.generate.output.outcome,
                        createdDatetime: new Date().toISOString(),
                    })
                }

                setMessages(updatedMessages)
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
                        message: newMessage,
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
                const errorMessages = [...newMessages, errorMessage]
                setMessages(errorMessages)
            }
        },
        [
            accountId,
            channel,
            gorgiasDomain,
            httpIntegrationId,
            messages,
            onNewConversation,
            storeData,
            submitPlaygroundTicket,
        ]
    )

    return {
        messages,
        onMessageSend,
        isMessageSending: isSubmitting,
        onNewConversation,
    }
}
