import MockAdapter from 'axios-mock-adapter'

import { billingContact } from 'fixtures/resources'
import client from 'models/api/resources'

import {
    getAiAgentGeneration6Plan,
    getBillingContact,
    getProductsUsage,
    trackBillingEvent,
    upgradeAiAgentSubscriptionGeneration6Plan,
} from '../resources'
import { ProductType } from '../types'

const mockedServer = new MockAdapter(client)

describe('billing resources', () => {
    afterEach(() => {
        mockedServer.reset()
    })

    describe('getBillingContact', () => {
        it('should fetch successfully', async () => {
            mockedServer
                .onGet('/api/billing/contact/')
                .reply(200, billingContact)

            const res = await getBillingContact()
            expect(res.status).toEqual(200)
            expect(res.data).toEqual(billingContact)
        })

        it.each([null, '', [], {}, '<html />'])(
            'should raise an error if the reply is invalid [value: %s]',
            async (value: any) => {
                mockedServer.onGet('/api/billing/contact/').reply(200, value)

                expect(getBillingContact).rejects.toThrow()
            },
        )
    })

    describe('trackBillingEvent', () => {
        it('tracks billing event successfully', async () => {
            const eventName = 'someEvent'
            const event = {
                product_type: ProductType.Helpdesk,
                primary_reason: 'I am not happy with the product',
                secondary_reason: 'Other',
                other_reason: 'Would like 1000000 more tickets for free.',
                accepted: false,
            }
            mockedServer
                .onPost('/billing/events-tracking')
                .reply(201, { any: 'response' })

            const res = await trackBillingEvent(eventName, event)
            expect(res.status).toEqual(201)
            expect(res.data).toEqual({ any: 'response' })
        })
    })

    describe('getAiAgentGeneration6Plan', () => {
        it('should resolve with plan data on success', async () => {
            const mockPlan = {
                plan: {
                    id: 1,
                    name: 'AI Agent Generation 6',
                    price: 50,
                    currency: 'USD',
                },
            }

            mockedServer
                .onGet('/api/billing/ai-agent-generation-6')
                .reply(200, mockPlan)

            const result = await getAiAgentGeneration6Plan()

            expect(result).toEqual(mockPlan)
        })

        it('should resolve with null when no plan is available', async () => {
            mockedServer
                .onGet('/api/billing/ai-agent-generation-6')
                .reply(200, null)

            const result = await getAiAgentGeneration6Plan()

            expect(result).toBeNull()
        })

        it('should handle errors correctly', async () => {
            mockedServer
                .onGet('/api/billing/ai-agent-generation-6')
                .reply(500, { error: 'Server error' })

            await expect(getAiAgentGeneration6Plan()).rejects.toThrow(
                'Request failed with status code 500',
            )
        })
    })

    describe('upgradeAiAgentSubscriptionGeneration6Plan', () => {
        it('should successfully upgrade subscription', async () => {
            const mockResponse = {
                success: true,
                message: 'Subscription upgraded successfully',
            }

            mockedServer
                .onPost('/api/billing/ai-agent-generation-6')
                .reply(200, mockResponse)

            const result = await upgradeAiAgentSubscriptionGeneration6Plan()

            expect(result).toEqual(mockResponse)
        })

        it('should handle errors correctly', async () => {
            mockedServer
                .onPost('/api/billing/ai-agent-generation-6')
                .reply(400, { error: 'Upgrade failed' })

            await expect(
                upgradeAiAgentSubscriptionGeneration6Plan(),
            ).rejects.toThrow('Request failed with status code 400')
        })

        it('should send empty object as request body', async () => {
            const mockResponse = { success: true }

            mockedServer
                .onPost('/api/billing/ai-agent-generation-6', {})
                .reply(200, mockResponse)

            const result = await upgradeAiAgentSubscriptionGeneration6Plan()

            expect(result).toEqual(mockResponse)
            expect(mockedServer.history.post[0].data).toEqual('{}')
        })
    })

    describe('getProductsUsage', () => {
        it('should successfully fetch products usage', async () => {
            const mockUsage = {
                helpdesk: {
                    usage: { tickets: 100 },
                    meta: { subscription_end_datetime: '2024-12-31' },
                },
            }

            mockedServer.onGet('/billing/products-usages').reply(200, mockUsage)

            const result = await getProductsUsage()

            expect(result).toEqual(mockUsage)
        })

        it('should handle errors correctly', async () => {
            mockedServer
                .onGet('/billing/products-usages')
                .reply(500, { error: 'Server error' })

            await expect(getProductsUsage()).rejects.toThrow(
                'Request failed with status code 500',
            )
        })
    })
})
