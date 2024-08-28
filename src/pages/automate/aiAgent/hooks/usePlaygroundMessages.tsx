import React, {useCallback, useMemo, useRef, useState} from 'react'
import axios from 'axios'
import {useSubmitPlaygroundTicket} from 'models/aiAgent/queries'
import {reportError} from 'utils/errors'
import {
    AiAgentResponse,
    MessageType,
    PlaygroundMessage,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'
import {StoreConfiguration} from 'models/aiAgent/types'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {
    AI_AGENT_SENDER,
    PlaygroundGenericErrorMessage,
} from '../components/PlaygroundMessage/PlaygroundMessage'
import {CustomerHttpIntegrationDataMock} from '../constants'
import {PlaygroundFormValues} from '../components/PlaygroundChat/PlaygroundChat.types'

const mapFormValuesToMessage = (
    formValues: PlaygroundFormValues
): PlaygroundMessage => {
    return {
        sender:
            formValues.customerName ??
            formValues.customerEmail ?? // email as fallback
            CustomerHttpIntegrationDataMock.name,
        type: MessageType.MESSAGE,
        message: formValues.message,
        createdDatetime: new Date().toISOString(),
    }
}

const shouldAiAgentResponseDisplay = (
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

export const usePlaygroundMessages = ({
    storeData,
    gorgiasDomain,
    accountId,
    httpIntegrationId,
    currentUserFirstName,
}: {
    storeData: StoreConfiguration
    gorgiasDomain: string
    accountId: number
    httpIntegrationId: number
    currentUserFirstName?: string
}) => {
    const initialMessages: PlaygroundMessage[] = useMemo(
        () => [
            {
                sender: AI_AGENT_SENDER,
                type: MessageType.MESSAGE,
                message: `Hi${
                    currentUserFirstName ? ` ${currentUserFirstName}` : ''
                }!<br/><br/>Welcome to your AI Agent test area.<br/><br/>Your test area lets you search for an <b>existing customer</b> to see how your AI Agent would respond <b>based on your resources and the customer’s order history.</b><br/><br/>If you want to improve the response, you can edit your resources and re-test your question.`,
                createdDatetime: new Date().toISOString(),
            },
        ],
        [currentUserFirstName]
    )

    const [messages, setMessages] =
        useState<PlaygroundMessage[]>(initialMessages)

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
        async (formValues: PlaygroundFormValues) => {
            const newMessage = mapFormValuesToMessage(formValues)

            const aiAgentMessagePlaceholder = {
                sender: AI_AGENT_SENDER,
                type: MessageType.MESSAGE,
                createdDatetime: new Date().toISOString(),
            }
            const newMessages = [...messages, newMessage]
            setMessages([...newMessages, aiAgentMessagePlaceholder])

            const mockContext =
                formValues.customerEmail === undefined ||
                formValues.customerEmail ===
                    CustomerHttpIntegrationDataMock.address

            const customerEmail =
                formValues.customerEmail ??
                CustomerHttpIntegrationDataMock.address

            try {
                const abortController = new AbortController()
                abortControllerRef.current = abortController
                const emailIntegration = storeData.monitoredEmailIntegrations[0]

                // This should not happen because we check email integration in the parent component
                if (!emailIntegration) {
                    throw new Error(
                        'Monitored Email Integration not found in storeConfiguration'
                    )
                }

                const {data: aiAgentResponse} = await submitPlaygroundTicket([
                    {
                        use_mock_context: mockContext,
                        domain: gorgiasDomain,
                        customer_email: customerEmail,
                        body_text: formValues.message,
                        created_datetime: newMessage.createdDatetime,
                        // TODO: move this logic to the helper
                        messages: newMessages
                            .slice(1) // remove initial message
                            .filter((m) => m.type === MessageType.MESSAGE)
                            .map((m) => ({
                                bodyText:
                                    typeof m.message === 'string'
                                        ? m.message
                                        : '',
                                fromAgent: m.sender === AI_AGENT_SENDER,
                                createdDatetime: m.createdDatetime,
                                meta: '',
                            })),
                        subject: formValues.subject ?? '',
                        http_integration_id: httpIntegrationId,
                        account_id: accountId,
                        meta: '',
                        email_integration_id: emailIntegration.id,
                        email_integration_address: emailIntegration.email,
                        _action_serialized_state:
                            actionSerializedStateRef.current,
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
                        message:
                            aiAgentResponse.postProcessing.htmlReply ??
                            aiAgentResponse.generate.output.generated_message,
                        createdDatetime: new Date().toISOString(),
                    })
                }

                updatedMessages.push({
                    sender: AI_AGENT_SENDER,
                    type: MessageType.INTERNAL_NOTE,
                    message: aiAgentResponse.postProcessing.internalNote,
                    createdDatetime: new Date().toISOString(),
                })

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

                const errorMessage = {
                    sender: AI_AGENT_SENDER,
                    type: MessageType.ERROR,
                    message: (
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
