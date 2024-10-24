// Import the functions to test
import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'

import {getCreditCard, trackBillingEvent} from '../resources'
import {ProductType} from '../types' // Update this path based on your project structure

const mockedServer = new MockAdapter(client)

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
            .reply(201, {any: 'response'})

        const res = await trackBillingEvent(eventName, event)
        expect(res.status).toEqual(201)
        expect(res.data).toEqual({any: 'response'})
    })
})

describe('getCreditCard', () => {
    it('should resolve with a card on success', async () => {
        const card = {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2026,
        }

        mockedServer.onGet('/api/billing/credit-card/').reply(200, card)

        expect((await getCreditCard()).data).toEqual(card)
    })

    it('should reject an error on fail', async () => {
        mockedServer
            .onGet('/api/billing/credit-card/')
            .reply(503, {message: 'error'})

        let error

        try {
            await getCreditCard()
        } catch (e) {
            error = e
        }

        expect(error).toEqual(new Error('Request failed with status code 503'))
    })
})
