import { useCallback } from 'react'

import type {
    JourneyConfigurationApiDTO,
    JourneyTypeEnum,
} from '@gorgias/convert-client'

import type { Product } from 'constants/integrations/types/shopify'
import { useTriggerAIJourney } from 'models/aiAgent/queries'
import type { CreateAIJourneyPlaygroundOptions } from 'models/aiAgent/resources/ai-journey'
import { useAIJourneyContext } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { useConfigurationContext } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import type { AIJourneySettings } from 'pages/aiAgent/PlaygroundV2/types'

type CreateAIJourneyPayloadParams = {
    accountId: number
    storeIntegrationId: number
    storeName: string
    journeyId: string
    journeyType: JourneyTypeEnum
    sessionId: string
    followUpMessagesSent: number
    aiJourneySettings: AIJourneySettings
    journeyConfiguration: JourneyConfigurationApiDTO | undefined
    shopDomain: string | undefined
    selectedProduct: Product | null
}

const createAIJourneyPayload: (
    params: CreateAIJourneyPayloadParams,
) => CreateAIJourneyPlaygroundOptions = ({
    accountId,
    storeIntegrationId,
    storeName,
    journeyId,
    journeyType,
    sessionId,
    followUpMessagesSent,
    aiJourneySettings,
    journeyConfiguration,
    shopDomain,
    selectedProduct,
}) => {
    const payload: CreateAIJourneyPlaygroundOptions = {
        accountId,
        storeIntegrationId,
        storeName,
        storeType: 'shopify' as const,
        journeyId,
        journeyMessageInstructions:
            aiJourneySettings.outboundMessageInstructions,
        journeyType,
        followUpAttempt: followUpMessagesSent,
        testModeSessionId: sessionId,
        returningCustomer: aiJourneySettings.returningCustomer,
        settings: {
            maxFollowUpMessages: aiJourneySettings.totalFollowUp,
            smsSenderNumber: journeyConfiguration?.sms_sender_number ?? null,
            smsSenderIntegrationId:
                journeyConfiguration?.sms_sender_integration_id ?? null,
            offerDiscount: aiJourneySettings.includeDiscountCode,
            maxDiscountPercent: aiJourneySettings.discountCodeValue ?? null,
            discountCodeMessageThreshold:
                aiJourneySettings.discountCodeMessageIdx,
        },
    }

    if (selectedProduct) {
        payload.cart = {
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
        }

        payload.lastOrder = {
            id: 1,
            createdAt: new Date().toISOString(),
            items: [
                {
                    name: selectedProduct.title,
                    variantId: String(selectedProduct.variants[0]?.id),
                    productId: String(selectedProduct.id),
                    quantity: 1,
                    linePrice: Number(selectedProduct.variants[0]?.price),
                },
            ],
        }

        payload.order = {
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
            totalPrice: Number(selectedProduct.variants[0]?.price || 99.99),
            currency: 'USD',
            financialStatus: 'paid',
            fulfillmentStatus: null,
            createdAt: new Date().toISOString(),
        }

        if (shopDomain) {
            payload.page = {
                url: `https://${shopDomain}/products/${selectedProduct.handle}`,
                productId: String(selectedProduct.id),
            }
        }
    }

    return payload
}

export const useAiJourneyMessages = () => {
    const {
        aiJourneySettings,
        shopifyIntegration,
        shopName,
        followUpMessagesSent,
        setFollowUpMessagesSent,
        currentJourney,
        journeyConfiguration,
    } = useAIJourneyContext()
    const { accountId } = useConfigurationContext()
    const { createTestSession, testSessionId, startPolling } = useCoreContext()
    const { mutateAsync, isLoading } = useTriggerAIJourney()

    const triggerMessage = useCallback(async () => {
        if (!currentJourney || !shopifyIntegration) {
            throw new Error('Missing journey or integration configuration')
        }

        const sessionId = testSessionId ?? (await createTestSession())

        const shopDomain = shopifyIntegration.meta?.shop_domain ?? undefined
        const selectedProduct = aiJourneySettings.selectedProduct

        const payload = createAIJourneyPayload({
            accountId,
            storeIntegrationId: shopifyIntegration.id,
            storeName: shopName,
            journeyId: currentJourney.id,
            journeyType: currentJourney.type,
            sessionId,
            followUpMessagesSent,
            aiJourneySettings,
            journeyConfiguration,
            shopDomain,
            selectedProduct,
        })

        await mutateAsync([payload])

        startPolling()
        setFollowUpMessagesSent((prev) => prev + 1)
    }, [
        startPolling,
        currentJourney,
        shopifyIntegration,
        testSessionId,
        createTestSession,
        mutateAsync,
        accountId,
        shopName,
        aiJourneySettings,
        followUpMessagesSent,
        journeyConfiguration,
        setFollowUpMessagesSent,
    ])

    return {
        triggerMessage,
        isTriggeringMessage: isLoading,
    }
}
