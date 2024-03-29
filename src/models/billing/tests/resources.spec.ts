// Import the functions to test
import MockAdapter from 'axios-mock-adapter'
import client from 'models/api/resources'
import {trackBillingEvent} from '../resources'
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
