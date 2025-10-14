import { JourneyTypeEnum } from '@gorgias/convert-client'

import { TriggerAIJourneyPayload, TriggerAIJourneyResponse } from '../types'
import { apiClient } from './message-processing'

type CreateAIJourneyPlaygroundOptions = {
    // Required fields
    accountId: number
    storeIntegrationId: number
    storeName: string
    storeType?: string
    journeyType: JourneyTypeEnum

    // Optional fields with defaults
    journeyId?: string | null
    journeyMessageInstructions?: string | null
    followUpAttempt?: number
    testModeSessionId?: string

    cart?: {
        lineItems: Array<{
            variantId: string
            productId: string
            quantity: number
            linePrice: number
        }>
    }

    settings: {
        maxFollowUpMessages: number | null
        smsSenderNumber: string | null
        smsSenderIntegrationId: number | null
        offerDiscount: boolean
        maxDiscountPercent: number | null
        brandName?: string | null
        discountCodeMessageThreshold?: number | null
        optOutMessage?: string | null
    }
}

const createAIJourneyPlaygroundPayload = (
    options: CreateAIJourneyPlaygroundOptions,
): TriggerAIJourneyPayload => {
    const now = Date.now()
    const nowISO = new Date(now).toISOString()

    // Mock customer - hardcoded
    const mockCustomer = {
        id: 1234567,
        phone: '+15551234567',
        timezone: 'America/New_York',
        language: 'en',
    }

    // Default cart items if not provided
    const defaultLineItems = [
        {
            variantId: '42972732358758',
            productId: '7698314297446',
            quantity: 1,
            linePrice: 34.99,
        },
    ]

    return {
        accountId: options.accountId,
        journeyId: options.journeyId ?? null,
        journeyParticipationId: null,
        storeIntegrationId: options.storeIntegrationId,
        followUpAttempt: options.followUpAttempt ?? 0,
        journeyType: options.journeyType,
        storeName: options.storeName,
        storeType: options.storeType ?? 'shopify',
        ticketId: '1234567',
        marketingId: `marketing-${now}`,
        createdAt: nowISO,
        customer: mockCustomer,
        cart: {
            cartToken: `test-cart-${now}`,
            lastCartUpdate: nowISO,
            currency: 'USD',
            abandonedCheckoutUrl: `https://${options.storeName}.myshopify.com/checkout/test`,
            lineItems: options.cart?.lineItems ?? defaultLineItems,
        },
        settings: {
            maxFollowUpMessages: options.settings.maxFollowUpMessages,
            smsSenderNumber: options.settings.smsSenderNumber,
            smsSenderIntegrationId: options.settings.smsSenderIntegrationId,
            offerDiscount: options.settings.offerDiscount,
            maxDiscountPercent: options.settings.maxDiscountPercent,
            brandName: options.settings.brandName,
            optOutMessage:
                options.settings.optOutMessage ?? 'Reply STOP to unsubscribe',
            discountCodeMessageThreshold:
                options.settings.discountCodeMessageThreshold ?? null,
        },
        executionMode: 'test',
        journeyMessageInstructions: options.journeyMessageInstructions ?? null,
        testModeSessionId: options.testModeSessionId,
    }
}

export const triggerAIJourney = async (
    payload: TriggerAIJourneyPayload,
    abortController?: AbortController,
) => {
    const response = await apiClient.post<TriggerAIJourneyResponse>(
        '/api/interaction/ai-journey/trigger',
        payload,
        {
            signal: abortController?.signal,
        },
    )

    return response.data
}

export const createContextAndTriggerAIJourney = async (
    options: CreateAIJourneyPlaygroundOptions,
    abortController?: AbortController,
) => {
    const payload = createAIJourneyPlaygroundPayload(options)
    return await triggerAIJourney(payload, abortController)
}
