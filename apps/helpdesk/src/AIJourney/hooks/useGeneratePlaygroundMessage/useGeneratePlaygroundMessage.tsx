import { useCallback, useEffect, useRef, useState } from 'react'

import type {
    JourneyApiDTO,
    JourneyConfigurationApiDTO,
} from '@gorgias/convert-client'
import type { Integration } from '@gorgias/helpdesk-types'

import type { Product } from 'constants/integrations/types/shopify'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    useCreateTestSessionMutation,
    useTriggerAIJourney,
} from 'models/aiAgent/queries'
import { usePlaygroundPolling } from 'pages/aiAgent/PlaygroundV2/hooks/usePlaygroundPolling'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const POLLING_INTERVAL = 5 * 1000

type useGeneratePlaygroundMessageProps = {
    journey?: JourneyApiDTO
    currentIntegration?: Integration
    journeyMessageInstructions: string
    journeyParams?: JourneyConfigurationApiDTO
    journeyType: string
    selectedProduct: Product | null
    totalMessagesToBeGenerated: number
}

export const useGeneratePlaygroundMessage = ({
    journey,
    currentIntegration,
    journeyMessageInstructions,
    journeyParams,
    selectedProduct,
    totalMessagesToBeGenerated,
}: useGeneratePlaygroundMessageProps) => {
    const [testSessionId, setTestSessionId] = useState<string | null>(null)
    const [playgroundMessages, setPlaygroundMessages] = useState<
        string[] | undefined
    >(undefined)
    const [isGeneratingMessages, setIsGeneratingMessages] = useState(false)

    const dispatch = useAppDispatch()

    const createTestSession = useCreateTestSessionMutation()
    const triggerAIJourney = useTriggerAIJourney()

    const { testSessionLogs, startPolling, stopPolling, isPolling } =
        usePlaygroundPolling({
            testSessionId: testSessionId ?? '',
        })

    const isPollingRef = useRef(isPolling)
    const playgroundMessagesLengthRef = useRef(playgroundMessages?.length ?? 0)

    useEffect(() => {
        isPollingRef.current = isPolling
    }, [isPolling])

    useEffect(() => {
        playgroundMessagesLengthRef.current = playgroundMessages?.length ?? 0
    }, [playgroundMessages?.length])

    useEffect(() => {
        if (testSessionLogs?.status === 'finished') {
            stopPolling()
        }
        if (playgroundMessages?.length === totalMessagesToBeGenerated) {
            isPollingRef.current = false
            setIsGeneratingMessages(false)
        }
    }, [
        playgroundMessages,
        stopPolling,
        testSessionLogs?.status,
        totalMessagesToBeGenerated,
    ])

    useEffect(() => {
        const aiAgentReplyLog = testSessionLogs?.logs.filter(
            (log) => log.type === 'ai-agent-reply',
        )

        const messages =
            aiAgentReplyLog?.map((log) => log.data.message) || undefined

        setPlaygroundMessages(messages)
    }, [testSessionLogs])

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountId = currentAccount.get('id')

    const handleGenerateMessages = useCallback(async () => {
        try {
            if (!selectedProduct) {
                void dispatch(
                    notify({
                        message: 'Please select a product',
                        status: NotificationStatus.Error,
                    }),
                )
                return
            }

            if (!journey?.id || !currentIntegration || !journeyParams) {
                void dispatch(
                    notify({
                        message: 'Missing journey configuration',
                        status: NotificationStatus.Error,
                    }),
                )
                return
            }

            const { shop_domain: shopDomain } = currentIntegration.meta
            const { handle } = selectedProduct

            setPlaygroundMessages([])
            setIsGeneratingMessages(true)

            const testSessionResponse = await createTestSession.mutateAsync([])
            const newTestSessionId = testSessionResponse.testModeSession.id
            setTestSessionId(newTestSessionId)

            const options = {
                accountId: accountId,
                storeIntegrationId: currentIntegration.id,
                storeName: currentIntegration.name,
                storeType: 'shopify',
                journeyId: journey.id,
                journeyMessageInstructions: journeyMessageInstructions,
                journeyType: journey.type,
                followUpAttempt: 0,
                testModeSessionId: newTestSessionId,
                page: {
                    url: `https://${shopDomain}/products/${handle}`,
                    productId: String(selectedProduct.id),
                },
                cart: {
                    lineItems: [
                        {
                            variantId: String(
                                selectedProduct.variants[0]?.id || 'variant-1',
                            ),
                            productId: String(selectedProduct.id),
                            quantity: 1,
                            linePrice: Number(
                                selectedProduct.variants[0]?.price || 99.99,
                            ),
                        },
                    ],
                },
                settings: {
                    maxFollowUpMessages:
                        journeyParams.max_follow_up_messages ?? null,
                    smsSenderNumber: journeyParams.sms_sender_number ?? null,
                    smsSenderIntegrationId:
                        journeyParams.sms_sender_integration_id ?? null,
                    offerDiscount: journeyParams.offer_discount ?? false,
                    maxDiscountPercent:
                        journeyParams.max_discount_percent ?? null,
                    brandName: currentIntegration.name,
                    discountCodeMessageThreshold:
                        journeyParams.discount_code_message_threshold ?? null,
                },
                order: {
                    id: `order-${Date.now()}`,
                    lineItems: [
                        {
                            productId: String(selectedProduct.id),
                            variantId: String(
                                selectedProduct.variants[0]?.id || 'variant-1',
                            ),
                            quantity: 1,
                            price: String(
                                selectedProduct.variants[0]?.price || '99.99',
                            ),
                            title: selectedProduct.title,
                        },
                    ],
                    totalPrice: Number(
                        selectedProduct.variants[0]?.price || 99.99,
                    ),
                    currency: 'USD',
                    financialStatus: 'paid',
                    fulfillmentStatus: null,
                    createdAt: new Date().toISOString(),
                },
                returningCustomer: false,
            }

            while (
                playgroundMessagesLengthRef.current < totalMessagesToBeGenerated
            ) {
                const attemptOptions = {
                    ...options,
                    followUpAttempt: playgroundMessagesLengthRef.current,
                }
                await triggerAIJourney.mutateAsync([attemptOptions])
                startPolling()

                // use ref to prevent potential race condition issue
                isPollingRef.current = true

                // Wait for polling to complete
                while (isPollingRef.current) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, POLLING_INTERVAL),
                    )
                }
            }
        } catch (error) {
            console.error('Error in AI Journey test:', error)
            void dispatch(
                notify({
                    message: `Error triggering AI Journey test: ${error}`,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [
        journey,
        accountId,
        createTestSession,
        currentIntegration,
        dispatch,
        journeyMessageInstructions,
        journeyParams,
        startPolling,
        selectedProduct,
        totalMessagesToBeGenerated,
        triggerAIJourney,
    ])

    return {
        handleGenerateMessages,
        testSessionLogs,
        playgroundMessages,
        isGeneratingMessages,
    }
}
