// usePlaygroundApi.tsx
import { useCallback, useRef } from 'react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import {
    useSubmitPlaygroundTicket,
    useSubmitTestModeMessageMutation,
} from 'models/aiAgent/queries'
import type {
    AiAgentPlaygroundOptions,
    StoreConfiguration,
    TestModeSessionMessagePayload,
} from 'models/aiAgent/types'
import type { PlaygroundMessage } from 'models/aiAgentPlayground/types'
import { isApiEligiblePlaygroundMessage } from 'models/aiAgentPlayground/types'
import { AI_AGENT_SENDER } from 'pages/aiAgent/PlaygroundV2/constants'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { reportError } from 'utils/errors'

import { PLAYGROUND_CUSTOMER_MOCK } from '../../constants'
import type {
    PlaygroundChannelAvailability,
    PlaygroundChannels,
    PlaygroundCustomer,
} from '../types'
import { buildOfflineEvalPayload } from '../utils/offline-eval-payload.utils'
import {
    getLastShopperMessage,
    getPlaygroundMessageMeta,
    mapPlaygroundMessagesToServerMessages,
} from '../utils/playground-messages.utils'
import { getTicketCustomer } from '../utils/playground-ticket.util'

export const usePlaygroundApi = ({
    gorgiasDomain,
    accountId,
    httpIntegrationId,
    channelIntegrationId,
    isNewAgenticArchitectureEnabled,
    baseUrl,
}: {
    gorgiasDomain: string
    accountId: number
    httpIntegrationId: number
    channelIntegrationId?: number
    isNewAgenticArchitectureEnabled: boolean
    baseUrl?: string
}) => {
    const {
        mutateAsync: submitPlaygroundTicket,
        isLoading: isSubmittingTicket,
    } = useSubmitPlaygroundTicket()
    const submitPlaygroundMessageMutation = useSubmitTestModeMessageMutation()
    const submitPlaygroundMessageAsync =
        submitPlaygroundMessageMutation.mutateAsync
    const isSubmittingMessage = submitPlaygroundMessageMutation.isLoading
    const abortControllerRef = useRef<AbortController>()

    const abortCurrentRequest = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
    }, [])

    const { draftKnowledge, useV3, areActionsEnabled } = useCoreContext()
    const isSubmitting = isSubmittingTicket || isSubmittingMessage

    const callSubmitMessage = useCallback(
        (payload: TestModeSessionMessagePayload | {}) =>
            submitPlaygroundMessageAsync([baseUrl, payload]),
        [baseUrl, submitPlaygroundMessageAsync],
    )

    const submitMessage = useCallback(
        async ({
            messages,
            customer,
            subject,
            channel,
            storeData,
            channelAvailability,
            testSessionId,
            createTestSession,
        }: {
            messages: PlaygroundMessage[]
            customer: PlaygroundCustomer
            subject?: string
            channel: PlaygroundChannels
            storeData: StoreConfiguration
            channelAvailability?: PlaygroundChannelAvailability
            testSessionId: string | null
            createTestSession: (
                aiAgentPlaygroundOptions?: AiAgentPlaygroundOptions,
            ) => Promise<string | null>
        }) => {
            const filteredMessages = messages.filter(
                isApiEligiblePlaygroundMessage,
            )
            const lastMessage = getLastShopperMessage(filteredMessages)

            let consolidatedTestSessionId = testSessionId
            if (useV3) {
                if (!consolidatedTestSessionId) {
                    const offlineEvalPayload = buildOfflineEvalPayload({
                        customer,
                        storeData,
                        gorgiasDomain,
                        channel,
                        areActionsAllowedToExecute: areActionsEnabled,
                    })
                    consolidatedTestSessionId =
                        await createTestSession(offlineEvalPayload)
                }

                await callSubmitMessage({
                    sessionId: consolidatedTestSessionId,
                    userMessage: {
                        type: 'message',
                        role: 'user',
                        content: [
                            {
                                type: 'input_text',
                                text: lastMessage.content,
                            },
                        ],
                    },
                    isDirectModelCall: false,
                })
                return
            }

            // Traditional playground ticket submission flow
            let messageCustomer
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
                messageCustomer = PLAYGROUND_CUSTOMER_MOCK
            }

            const abortController = new AbortController()
            abortControllerRef.current = abortController

            // Check if it's an initial message and create test session
            const isInitialMessage =
                messages.filter((m) => m.sender !== AI_AGENT_SENDER).length ===
                1
            let testSessionIdToUse = testSessionId
            if (isNewAgenticArchitectureEnabled && isInitialMessage) {
                testSessionIdToUse = await createTestSession()
            }

            await submitPlaygroundTicket([
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
                    _playground_options: {
                        shopName: storeData.storeName,
                    },
                    _knowledge_override_rules: draftKnowledge
                        ? [
                              {
                                  name: 'overridesLiveKnowledgeWithDraftKnowledge',
                                  knowledge: [
                                      {
                                          sourceId: draftKnowledge.sourceId,
                                          sourceSetId:
                                              draftKnowledge.sourceSetId,
                                      },
                                  ],
                              },
                          ]
                        : [],
                    channel_integration_id: channelIntegrationId,
                },
                testSessionIdToUse ?? '',
                abortController,
                baseUrl,
            ])
        },
        [
            accountId,
            gorgiasDomain,
            httpIntegrationId,
            submitPlaygroundTicket,
            channelIntegrationId,
            isNewAgenticArchitectureEnabled,
            baseUrl,
            draftKnowledge,
            callSubmitMessage,
            useV3,
            areActionsEnabled,
        ],
    )

    return {
        submitMessage,
        isSubmitting,
        abortCurrentRequest,
    }
}
