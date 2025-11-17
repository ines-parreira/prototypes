import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import axios from 'axios'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useFlag } from 'core/flags'
import type { StoreConfiguration } from 'models/aiAgent/types'
import type {
    PlaygroundMessage,
    PlaygroundPromptMessage,
    PlaygroundTextMessage,
} from 'models/aiAgentPlayground/types'
import { MessageType } from 'models/aiAgentPlayground/types'
import { reportError } from 'utils/errors'

import type {
    PlaygroundChannelAvailability,
    PlaygroundChannels,
} from '../components/PlaygroundChat/PlaygroundChat.types'
import {
    AI_AGENT_SENDER,
    GREETING_MESSAGE_TEXT,
    PlaygroundGenericErrorMessage,
} from '../components/PlaygroundMessage/PlaygroundMessage'
import type { PlaygroundCustomer } from '../types'
import {
    handleAiAgentResponse,
    handleAiAgentTestSessionLog,
} from '../utils/playground-handler.utils'
import { shouldDisplayActions } from '../utils/playground-messages.utils'
import { usePlaygroundApi } from './usePlaygroundApi'
import { usePlaygroundPolling } from './usePlaygroundPolling'
import { useTestSession } from './useTestSession'

const PLACEHOLDER_MESSAGE: PlaygroundMessage = {
    sender: AI_AGENT_SENDER,
    type: MessageType.PLACEHOLDER,
    createdDatetime: new Date().toISOString(),
}
const GREETING_MESSAGE: PlaygroundMessage = {
    sender: AI_AGENT_SENDER,
    type: MessageType.MESSAGE,
    content: GREETING_MESSAGE_TEXT,
    createdDatetime: new Date().toISOString(),
}

export const usePlaygroundMessages = ({
    storeData,
    gorgiasDomain,
    accountId,
    httpIntegrationId,
    channel,
    channelIntegrationId,
    channelAvailability,
    baseUrl,
    arePlaygroundActionsAllowed,
}: {
    storeData: StoreConfiguration
    gorgiasDomain: string
    accountId: number
    httpIntegrationId: number
    currentUserFirstName?: string
    channel: PlaygroundChannels
    channelIntegrationId?: number
    channelAvailability?: PlaygroundChannelAvailability
    baseUrl?: string
    arePlaygroundActionsAllowed?: boolean
}) => {
    const isNewAgenticArchitectureEnabled = useFlag(
        FeatureFlagKey.AiAgentUseNewAgenticArchitecture,
    )
    const initialMessages: PlaygroundMessage[] = useMemo(() => [], [])

    const { testSessionId, createTestSession } = useTestSession(baseUrl, {
        areActionsAllowedToExecute: arePlaygroundActionsAllowed ?? false,
    })

    const { testSessionLogs, startPolling, stopPolling, isPolling } =
        usePlaygroundPolling({
            testSessionId: testSessionId ?? '',
            baseUrl,
        })

    const { submitMessage, isSubmitting, abortCurrentRequest } =
        usePlaygroundApi({
            gorgiasDomain,
            accountId,
            httpIntegrationId,
            channelIntegrationId,
            isNewAgenticArchitectureEnabled,
            baseUrl,
        })

    const [messages, setMessages] =
        useState<PlaygroundMessage[]>(initialMessages)

    const processedLogIds = useRef(new Set<string>())

    const [isWaitingResponse, setIsWaitingResponse] = useState(false)

    useEffect(() => {
        setMessages(initialMessages)
        setIsWaitingResponse(false)
    }, [initialMessages])

    const onNewConversation = useCallback(() => {
        abortCurrentRequest()
        stopPolling()
        setMessages(initialMessages)
        setIsWaitingResponse(false)
    }, [initialMessages, abortCurrentRequest, stopPolling])

    const processMessages = useCallback(
        async (
            newMessages: PlaygroundMessage[],
            {
                customer,
                subject,
            }: { customer: PlaygroundCustomer; subject?: string },
        ) => {
            try {
                const response = await submitMessage({
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

                const aiAgentMessages = handleAiAgentResponse({
                    channel,
                    aiAgentResponse: response,
                    storeData,
                })

                if (shouldDisplayActions(response)) {
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
            onNewConversation,
            storeData,
            submitMessage,
            createTestSession,
            channelAvailability,
            testSessionId,
            isNewAgenticArchitectureEnabled,
            startPolling,
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
        [channel, messages, processMessages, isNewAgenticArchitectureEnabled],
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
                const newLogs = testSessionLogs.logs.filter(
                    (log) => !processedLogIds.current.has(log.id),
                )

                // Process only new logs
                const newMessages = newLogs
                    .map((log) => {
                        const message = handleAiAgentTestSessionLog(log)
                        if (message) {
                            // Add the log id to the processed set to avoid duplicates
                            processedLogIds.current.add(log.id)
                        }
                        return message
                    })
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
