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
import { MessageType, TestSessionLogType } from 'models/aiAgentPlayground/types'
import { useGetCustomer } from 'models/customer/queries'
import { DEFAULT_PLAYGROUND_CUSTOMER } from 'pages/aiAgent/constants'
import { PlaygroundGenericErrorMessage } from 'pages/aiAgent/PlaygroundV2/components/PlaygroundGenericErrorMessage/PlaygroundGenericErrorMessage'
import {
    AI_AGENT_SENDER,
    CUSTOMER_SENDER_FALLBACK,
    GREETING_MESSAGE_TEXT,
} from 'pages/aiAgent/PlaygroundV2/constants'
import { useAIJourneyContext } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { useConfigurationContext } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { useSubscribeToEvent } from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'
import { useSettingsContext } from 'pages/aiAgent/PlaygroundV2/contexts/SettingsContext'

import type { PlaygroundChannels, PlaygroundCustomer } from '../types'
import { PlaygroundEvent } from '../types'
import type { ResolveShopperSenderName } from '../utils/playground-handler.utils'
import { handleAiAgentTestSessionLog } from '../utils/playground-handler.utils'
import { usePlaygroundApi } from './usePlaygroundApi'

const OPTIMISTIC_MESSAGE_ID = '00000000-0000-0000-0000-000000000000'

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

const getChannelIntegrationId = (
    channel: PlaygroundChannels,
    ids: {
        chatIntegrationId?: number
        smsIntegrationId?: number
        emailIntegrationId?: number
    },
) => {
    switch (channel) {
        case 'chat':
            return ids.chatIntegrationId
        case 'sms':
            return ids.smsIntegrationId
        case 'email':
            return ids.emailIntegrationId
        default:
            return
    }
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
        smsIntegrationId,
        emailIntegrationId,
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
    const { selectedCustomer, setSettings } = useSettingsContext()

    const resolveShopperSenderName: ResolveShopperSenderName = useCallback(
        (customerId) => {
            if (customerId == null || customerId === '0') {
                return selectedCustomer.name ?? DEFAULT_PLAYGROUND_CUSTOMER.name
            }

            if (String(selectedCustomer.id) === customerId) {
                return selectedCustomer.name ?? selectedCustomer.email
            }

            return undefined
        },
        [selectedCustomer.id, selectedCustomer.name, selectedCustomer.email],
    )

    const channelIntegrationId =
        journeyConfiguration?.sms_sender_integration_id ??
        getChannelIntegrationId(channel, {
            chatIntegrationId,
            smsIntegrationId,
            emailIntegrationId,
        })

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

    const latestShopperCustomerId = (() => {
        const logs = testSessionLogs?.logs
        if (!logs?.length) return undefined
        for (let i = logs.length - 1; i >= 0; i--) {
            const log = logs[i]
            if (log.type !== TestSessionLogType.SHOPPER_MESSAGE) continue
            const id = log.data.customerId
            if (id && id !== '0') return Number(id)
        }
        return undefined
    })()

    const customerToFetch =
        latestShopperCustomerId &&
        latestShopperCustomerId !== selectedCustomer.id
            ? latestShopperCustomerId
            : undefined

    const { data: fetchedCustomer } = useGetCustomer(customerToFetch ?? 0, {
        enabled: !!customerToFetch,
    })

    useEffect(() => {
        const data = fetchedCustomer?.data
        if (!data || data.id === selectedCustomer.id) return
        setSettings({
            selectedCustomer: {
                id: data.id,
                email: data.email ?? '',
                name:
                    data.name ||
                    [data.firstname, data.lastname].filter(Boolean).join(' ') ||
                    undefined,
            },
        })
    }, [fetchedCustomer, selectedCustomer.id, setSettings])

    // When the selected customer is resolved after messages with the
    // generic fallback sender were already rendered, retroactively
    // replace the fallback with the resolved customer name.
    useEffect(() => {
        const resolvedName = selectedCustomer.name ?? selectedCustomer.email
        if (!resolvedName || resolvedName === CUSTOMER_SENDER_FALLBACK) return
        setMessages((prevMessages) => {
            let didChange = false
            const next = prevMessages.map((message) => {
                if (
                    message.type === MessageType.MESSAGE &&
                    message.sender === CUSTOMER_SENDER_FALLBACK
                ) {
                    didChange = true
                    return { ...message, sender: resolvedName }
                }
                return message
            })
            return didChange ? next : prevMessages
        })
    }, [selectedCustomer.name, selectedCustomer.email])

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
                            resolveShopperSenderName,
                        ),
                    )
                    .filter(
                        (message): message is NonNullable<typeof message> =>
                            message !== null,
                    )

                // Drop optimistic shopper messages once the matching
                // SHOPPER_MESSAGE log arrives, to avoid duplicates
                const isShopperTextMessage = (
                    message: PlaygroundMessage,
                ): message is PlaygroundTextMessage =>
                    message.type === MessageType.MESSAGE &&
                    message.sender !== AI_AGENT_SENDER

                const newShopperContents = new Set(
                    newMessages
                        .filter(isShopperTextMessage)
                        .map((m) => m.content),
                )
                const dedupedExisting = messagesWithoutPlaceholder.filter(
                    (message) => {
                        if (
                            !isShopperTextMessage(message) ||
                            message.id !== OPTIMISTIC_MESSAGE_ID
                        ) {
                            return true
                        }
                        return !newShopperContents.has(message.content)
                    },
                )

                const shouldShowPlaceholder =
                    testSessionLogs.status !== 'finished'

                // Add the new processed messages with placeholder
                return [
                    ...dedupedExisting,
                    ...newMessages,
                    ...(shouldShowPlaceholder ? [PLACEHOLDER_MESSAGE] : []),
                ]
            })
        }
    }, [testSessionLogs, resolveShopperSenderName])

    return {
        messages,
        onMessageSend,
        isMessageSending: isSubmitting || isPolling,
        onNewConversation,
        isWaitingResponse,
    }
}
