import { useCallback, useEffect, useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { reportError } from '@repo/logging'
import { isCancel } from 'axios'

import { SentryTeam } from 'common/const/sentryTeamNames'
import type {
    PlaygroundMessage,
    PlaygroundPromptMessage,
    PlaygroundTextMessage,
} from 'models/aiAgentPlayground/types'
import { MessageType } from 'models/aiAgentPlayground/types'
import { PlaygroundGenericErrorMessage } from 'pages/aiAgent/PlaygroundV2/components/PlaygroundGenericErrorMessage/PlaygroundGenericErrorMessage'
import {
    AI_AGENT_SENDER,
    GREETING_MESSAGE_TEXT,
} from 'pages/aiAgent/PlaygroundV2/constants'
import { useAIJourneyContext } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { useConfigurationContext } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { useSubscribeToEvent } from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'

import type { PlaygroundCustomer } from '../types'
import { PlaygroundEvent } from '../types'
import { handleAiAgentTestSessionLog } from '../utils/playground-handler.utils'
import { usePlaygroundApi } from './usePlaygroundApi'

const PLACEHOLDER_MESSAGE: PlaygroundMessage = {
    sender: AI_AGENT_SENDER,
    type: MessageType.PLACEHOLDER,
    createdDatetime: new Date().toISOString(),
}
const GREETING_MESSAGE: PlaygroundMessage = {
    id: '00000000-0000-0000-0000-000000000000',
    sender: AI_AGENT_SENDER,
    type: MessageType.MESSAGE,
    content: GREETING_MESSAGE_TEXT,
    createdDatetime: new Date().toISOString(),
}

export const usePlaygroundMessages = () => {
    const isNewAgenticArchitectureEnabled = useFlag(
        FeatureFlagKey.AiAgentUseNewAgenticArchitecture,
        false,
    )

    const {
        storeConfiguration: storeData,
        gorgiasDomain,
        accountId,
        httpIntegrationId,
        chatIntegrationId,
        baseUrl,
    } = useConfigurationContext()

    const {
        testSessionLogs,
        startPolling,
        stopPolling,
        isPolling,
        testSessionId,
        createTestSession,
        clearTestSession,
        channelAvailability,
        channel,
    } = useCoreContext()

    const { journeyConfiguration } = useAIJourneyContext()

    const channelIntegrationId =
        journeyConfiguration?.sms_sender_integration_id ??
        (channel === 'chat' ? chatIntegrationId : undefined)

    const { submitMessage, isSubmitting, abortCurrentRequest } =
        usePlaygroundApi({
            gorgiasDomain,
            accountId,
            httpIntegrationId,
            channelIntegrationId,
            baseUrl,
        })

    const [messages, setMessages] = useState<PlaygroundMessage[]>([])

    const processedLogIds = useRef(new Set<string>())

    const [isWaitingResponse, setIsWaitingResponse] = useState(false)

    const onNewConversation = useCallback(() => {
        abortCurrentRequest()
        stopPolling()
        clearTestSession()
        setMessages([])
        setIsWaitingResponse(false)
    }, [abortCurrentRequest, stopPolling, clearTestSession])

    useSubscribeToEvent(PlaygroundEvent.RESET_CONVERSATION, onNewConversation)

    const processMessages = useCallback(
        async (
            newMessages: PlaygroundMessage[],
            {
                customer,
                subject,
            }: { customer: PlaygroundCustomer; subject?: string },
        ) => {
            if (!storeData) return null
            try {
                await submitMessage({
                    messages: newMessages,
                    customer,
                    subject,
                    channel,
                    storeData,
                    channelAvailability,
                    testSessionId,
                    createTestSession,
                })

                if (isNewAgenticArchitectureEnabled) {
                    startPolling()
                    return
                }

                setMessages((prevMessages) => {
                    // Remove the placeholder
                    const filteredMessages: PlaygroundMessage[] =
                        prevMessages.filter(
                            (message) =>
                                message.type !== MessageType.PLACEHOLDER,
                        )

                    return [...filteredMessages]
                })
            } catch (error) {
                // skip if request canceled
                if (isCancel(error)) {
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
            onNewConversation,
            storeData,
            submitMessage,
            createTestSession,
            channelAvailability,
            testSessionId,
            isNewAgenticArchitectureEnabled,
            startPolling,
            channel,
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

                const messagesToAdd =
                    channel === 'chat' &&
                    !isNewAgenticArchitectureEnabled &&
                    messages.length === 1
                        ? [GREETING_MESSAGE, PLACEHOLDER_MESSAGE]
                        : [PLACEHOLDER_MESSAGE]

                newMessages.push(...messagesToAdd)
            }

            setMessages(newMessages)

            // Remove waiting state before each message send
            setIsWaitingResponse(false)

            await processMessages(newMessages, { customer, subject })
        },
        [messages, processMessages, isNewAgenticArchitectureEnabled, channel],
    )

    useEffect(() => {
        if (!testSessionLogs) return

        if (testSessionLogs.status === 'finished') {
            setIsWaitingResponse(false)
        }

        if (testSessionLogs.logs.length > 0) {
            setMessages((prevMessages) => {
                // Remove placeholder
                const messagesWithoutPlaceholder = prevMessages.filter(
                    (message) => message.type !== MessageType.PLACEHOLDER,
                )

                // Track existing message timestamps to avoid duplicates
                // we also avoid duplicates between the new logs
                const newLogs = testSessionLogs.logs.filter((log) => {
                    const notPresent = !processedLogIds.current.has(log.id)
                    processedLogIds.current.add(log.id)
                    return notPresent
                })

                // Process only new logs
                const newMessages = newLogs
                    .map((log, index) =>
                        handleAiAgentTestSessionLog(
                            log,
                            index > 0 ? newLogs[index - 1] : undefined,
                        ),
                    )
                    .filter(
                        (message): message is NonNullable<typeof message> =>
                            message !== null,
                    )

                const shouldShowPlaceholder =
                    testSessionLogs.status !== 'finished'

                // Add the new processed messages with placeholder
                return [
                    ...messagesWithoutPlaceholder,
                    ...newMessages,
                    ...(shouldShowPlaceholder ? [PLACEHOLDER_MESSAGE] : []),
                ]
            })
        }
    }, [testSessionLogs])

    return {
        messages,
        onMessageSend,
        isMessageSending: isSubmitting || isPolling,
        onNewConversation,
        isWaitingResponse,
    }
}
