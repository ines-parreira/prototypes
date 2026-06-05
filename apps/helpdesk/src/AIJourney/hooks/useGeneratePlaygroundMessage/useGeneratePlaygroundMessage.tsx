import { useCallback, useEffect, useRef, useState } from 'react'

import { toast } from '@gorgias/axiom'
import type {
    JourneyApiDTO,
    JourneyConfigurationApiDTO,
} from '@gorgias/convert-client'
import { JourneyTypeEnum } from '@gorgias/convert-client'
import type { Integration } from '@gorgias/helpdesk-types'

import { JOURNEY_TYPES } from 'AIJourney/constants'
import type { Product } from 'constants/integrations/types/shopify'
import useAppSelector from 'hooks/useAppSelector'
import {
    useCreateTestSessionMutation,
    useTriggerAIJourney,
} from 'models/aiAgent/queries'
import { usePlaygroundPolling } from 'pages/aiAgent/PlaygroundV2/hooks/usePlaygroundPolling'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

const POLLING_INTERVAL = 5 * 1000

type useGeneratePlaygroundMessageProps = {
    journey?: JourneyApiDTO
    currentIntegration?: Integration
    journeyMessageInstructions: string
    journeyParams?: JourneyConfigurationApiDTO
    journeyType: string
    selectedProduct: Product | null
    totalMessagesToBeGenerated: number
    returningCustomer?: boolean
    smsSenderIntegrationId?: number | null
    smsSenderNumber?: string | null
    brandName?: string | null
}

export const useGeneratePlaygroundMessage = ({
    journey,
    currentIntegration,
    journeyMessageInstructions,
    journeyParams,
    journeyType,
    selectedProduct,
    totalMessagesToBeGenerated,
    returningCustomer = false,
    smsSenderIntegrationId,
    smsSenderNumber,
    brandName,
}: useGeneratePlaygroundMessageProps) => {
    const [testSessionId, setTestSessionId] = useState<string | null>(null)
    const [playgroundMessages, setPlaygroundMessages] = useState<
        string[] | undefined
    >(undefined)
    const [isGeneratingMessages, setIsGeneratingMessages] = useState(false)

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
            const requiresProduct =
                journeyType !== JOURNEY_TYPES.WIN_BACK &&
                journeyType !== JOURNEY_TYPES.WELCOME &&
                journeyType !== JOURNEY_TYPES.CAMPAIGN

            if (requiresProduct && !selectedProduct) {
                toast.error('Please select a product')
                return
            }

            if (!journey?.id || !currentIntegration || !journeyParams) {
                toast.error('Missing journey configuration')
                return
            }

            const { shop_domain: shopDomain } = currentIntegration.meta

            setPlaygroundMessages([])
            setIsGeneratingMessages(true)

            const testSessionResponse = await createTestSession.mutateAsync([])
            const newTestSessionId = testSessionResponse.testModeSession.id
            setTestSessionId(newTestSessionId)

            const resolvedSmsSenderNumber =
                journeyParams.sms_sender_number ?? smsSenderNumber ?? null

            const resolvedSmsSenderIntegrationId =
                journeyParams.sms_sender_integration_id ??
                smsSenderIntegrationId ??
                null

            const options = {
                accountId: accountId,
                storeIntegrationId: currentIntegration.id,
                storeName: currentIntegration.name,
                storeType: 'shopify',
                journeyId: journey.id,
                journeyName: journey.campaign?.title ?? null,
                journeyMessageInstructions: journeyMessageInstructions,
                journeyType:
                    journey.type === JourneyTypeEnum.Custom
                        ? JourneyTypeEnum.Welcome
                        : journey.type,
                followUpAttempt: 0,
                testModeSessionId: newTestSessionId,
                ...(selectedProduct && {
                    page: {
                        url: `https://${shopDomain}/products/${selectedProduct.handle}`,
                        productId: String(selectedProduct.id),
                    },
                    cart: {
                        lineItems: [
                            {
                                variantId: String(
                                    selectedProduct.variants[0]?.id ||
                                        'variant-1',
                                ),
                                productId: String(selectedProduct.id),
                                quantity: 1,
                                linePrice: Number(
                                    selectedProduct.variants[0]?.price || 99.99,
                                ),
                            },
                        ],
                    },
                    order: {
                        id: `order-${Date.now()}`,
                        lineItems: [
                            {
                                productId: String(selectedProduct.id),
                                variantId: String(
                                    selectedProduct.variants[0]?.id ||
                                        'variant-1',
                                ),
                                quantity: 1,
                                price: String(
                                    selectedProduct.variants[0]?.price ||
                                        '99.99',
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
                }),
                settings: {
                    maxFollowUpMessages:
                        journeyParams.max_follow_up_messages ?? null,
                    smsSenderNumber: resolvedSmsSenderNumber,
                    smsSenderIntegrationId: resolvedSmsSenderIntegrationId,
                    offerDiscount: journeyParams.offer_discount ?? false,
                    maxDiscountPercent:
                        journeyParams.max_discount_percent ?? null,
                    brandName: brandName ?? currentIntegration.name,
                    discountCodeMessageThreshold:
                        journeyParams.discount_code_message_threshold ?? null,
                },
                returningCustomer,
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
            toast.error(`Error triggering AI Journey test: ${error}`)
        }
    }, [
        journey,
        accountId,
        createTestSession,
        currentIntegration,
        journeyMessageInstructions,
        journeyParams,
        journeyType,
        startPolling,
        selectedProduct,
        totalMessagesToBeGenerated,
        triggerAIJourney,
        returningCustomer,
        smsSenderIntegrationId,
        smsSenderNumber,
        brandName,
    ])

    return {
        handleGenerateMessages,
        testSessionLogs,
        playgroundMessages,
        isGeneratingMessages,
    }
}
