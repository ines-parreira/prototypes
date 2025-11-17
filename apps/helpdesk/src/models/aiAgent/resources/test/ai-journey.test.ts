import { JourneyTypeEnum } from '@gorgias/convert-client'

import type {
    TriggerAIJourneyPayload,
    TriggerAIJourneyResponse,
} from '../../types'
import {
    createContextAndTriggerAIJourney,
    triggerAIJourney,
} from '../ai-journey'
import { apiClient } from '../message-processing'

jest.mock('../message-processing', () => ({
    apiClient: {
        post: jest.fn(),
    },
}))

describe('AI Journey Resource', () => {
    describe('triggerAIJourney', () => {
        it('should trigger AI journey with correct payload', async () => {
            const mockPayload: TriggerAIJourneyPayload = {
                accountId: 6069,
                journeyId: '01JZAPAD606K1JSKNHC8KVA4BD',
                journeyParticipationId: null,
                storeIntegrationId: 33858,
                followUpAttempt: 0,
                storeName: 'artemisathletix',
                storeType: 'shopify',
                journeyType: JourneyTypeEnum.CartAbandoned,
                ticketId: '1756199485200',
                marketingId: 'marketing-1756199485200',
                createdAt: new Date().toISOString(),
                customer: {
                    id: 37605,
                    phone: '+18773983515',
                    timezone: 'America/New_York',
                    language: 'en',
                },
                cart: {
                    cartToken: 'test-cart-1756199485200',
                    lastCartUpdate: new Date().toISOString(),
                    currency: 'USD',
                    abandonedCheckoutUrl:
                        'https://artemisathletix.myshopify.com/checkout/test',
                    lineItems: [
                        {
                            variantId: '42972732358758',
                            productId: '7698314297446',
                            quantity: 1,
                            linePrice: 34.99,
                        },
                    ],
                },
                settings: {
                    maxFollowUpMessages: 1,
                    smsSenderNumber: '+18773983515',
                    smsSenderIntegrationId: 334789,
                    offerDiscount: true,
                    maxDiscountPercent: 25,
                    brandName: 'artemisathletix',
                    optOutMessage: 'Reply STOP to unsubscribe',
                    discountCodeMessageThreshold: 1,
                },
                executionMode: 'test',
                journeyMessageInstructions: null,
                testModeSessionId: '90a2b7b2-e936-4208-ad28-706611c1f9b6',
            }

            const mockResponse: TriggerAIJourneyResponse = {
                message: 'Dispatch operation successful',
                data: {
                    ticketId: '1756199485200',
                    executionId: '0198e5a5-805e-76be-92d8-3e566f2026b8',
                },
            }

            ;(apiClient.post as jest.Mock).mockResolvedValue({
                data: mockResponse,
            })

            const result = await triggerAIJourney(mockPayload)

            expect(apiClient.post).toHaveBeenCalledWith(
                '/api/interaction/ai-journey/trigger',
                mockPayload,
                {
                    signal: undefined,
                },
            )
            expect(result).toEqual(mockResponse)
        })
    })

    describe('createContextAndTriggerAIJourney', () => {
        it('should create payload from options and trigger AI journey', async () => {
            const mockOptions = {
                accountId: 6069,
                storeIntegrationId: 33858,
                storeName: 'artemisathletix',
                storeType: 'shopify',
                journeyType: JourneyTypeEnum.CartAbandoned,
                journeyId: '01JZAPAD606K1JSKNHC8KVA4BD',
                journeyMessageInstructions: 'Test instructions',
                followUpAttempt: 1,
                testModeSessionId: '90a2b7b2-e936-4208-ad28-706611c1f9b6',
                cart: {
                    lineItems: [
                        {
                            variantId: '12345',
                            productId: '67890',
                            quantity: 2,
                            linePrice: 49.99,
                        },
                    ],
                },
                settings: {
                    maxFollowUpMessages: 3,
                    smsSenderNumber: '+15551234567',
                    smsSenderIntegrationId: 123456,
                    offerDiscount: true,
                    maxDiscountPercent: 20,
                    brandName: 'Test Brand',
                    discountCodeMessageThreshold: 2,
                    optOutMessage: 'Text STOP to opt out',
                },
            }

            const mockResponse: TriggerAIJourneyResponse = {
                message: 'Dispatch operation successful',
                data: {
                    ticketId: '1234567',
                    executionId: '0198e5a5-805e-76be-92d8-3e566f2026b8',
                },
            }

            ;(apiClient.post as jest.Mock).mockResolvedValue({
                data: mockResponse,
            })

            const result = await createContextAndTriggerAIJourney(mockOptions)

            // Check that the API was called with the correctly transformed payload
            expect(apiClient.post).toHaveBeenCalledWith(
                '/api/interaction/ai-journey/trigger',
                expect.objectContaining({
                    accountId: 6069,
                    journeyId: '01JZAPAD606K1JSKNHC8KVA4BD',
                    journeyParticipationId: null,
                    storeIntegrationId: 33858,
                    followUpAttempt: 1,
                    storeName: 'artemisathletix',
                    storeType: 'shopify',
                    journeyType: JourneyTypeEnum.CartAbandoned,
                    ticketId: '1234567',
                    marketingId: expect.stringMatching(/^marketing-\d+$/),
                    createdAt: expect.any(String),
                    customer: {
                        id: 1234567,
                        phone: '+15551234567',
                        timezone: 'America/New_York',
                        language: 'en',
                    },
                    cart: {
                        cartToken: expect.stringMatching(/^test-cart-\d+$/),
                        lastCartUpdate: expect.any(String),
                        currency: 'USD',
                        abandonedCheckoutUrl:
                            'https://artemisathletix.myshopify.com/checkout/test',
                        lineItems: [
                            {
                                variantId: '12345',
                                productId: '67890',
                                quantity: 2,
                                linePrice: 49.99,
                            },
                        ],
                    },
                    settings: {
                        maxFollowUpMessages: 3,
                        smsSenderNumber: '+15551234567',
                        smsSenderIntegrationId: 123456,
                        offerDiscount: true,
                        maxDiscountPercent: 20,
                        brandName: 'Test Brand',
                        optOutMessage: 'Text STOP to opt out',
                        discountCodeMessageThreshold: 2,
                    },
                    executionMode: 'test',
                    journeyMessageInstructions: 'Test instructions',
                    testModeSessionId: '90a2b7b2-e936-4208-ad28-706611c1f9b6',
                }),
                {
                    signal: undefined,
                },
            )
            expect(result).toEqual(mockResponse)
        })

        it('should use default values when optional fields are not provided', async () => {
            const mockOptions = {
                accountId: 6069,
                storeIntegrationId: 33858,
                storeName: 'artemisathletix',
                journeyType: JourneyTypeEnum.CartAbandoned,
                settings: {
                    maxFollowUpMessages: null,
                    smsSenderNumber: null,
                    smsSenderIntegrationId: null,
                    offerDiscount: false,
                    maxDiscountPercent: null,
                },
            }

            const mockResponse: TriggerAIJourneyResponse = {
                message: 'Dispatch operation successful',
                data: {
                    ticketId: '1234567',
                    executionId: '0198e5a5-805e-76be-92d8-3e566f2026b8',
                },
            }

            ;(apiClient.post as jest.Mock).mockResolvedValue({
                data: mockResponse,
            })

            const result = await createContextAndTriggerAIJourney(mockOptions)

            // Check that defaults were applied
            expect(apiClient.post).toHaveBeenCalledWith(
                '/api/interaction/ai-journey/trigger',
                expect.objectContaining({
                    journeyId: null,
                    followUpAttempt: 0,
                    storeType: 'shopify',
                    journeyType: JourneyTypeEnum.CartAbandoned,
                    journeyMessageInstructions: null,
                    cart: expect.objectContaining({
                        lineItems: [
                            {
                                variantId: '42972732358758',
                                productId: '7698314297446',
                                quantity: 1,
                                linePrice: 34.99,
                            },
                        ],
                    }),
                    settings: expect.objectContaining({
                        optOutMessage: 'Reply STOP to unsubscribe',
                        discountCodeMessageThreshold: null,
                    }),
                }),
                {
                    signal: undefined,
                },
            )
            expect(result).toEqual(mockResponse)
        })
    })
})
