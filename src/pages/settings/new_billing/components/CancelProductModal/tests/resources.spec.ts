import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'

import {CHURN_MITIGATION_OFFER_ZAPIER_URL} from '../constants'
import {sendAcceptedChurnMitigationOfferToSupport} from '../resources'

const mockServer = new MockAdapter(client)

describe('sendAcceptedChurnMitigationOfferToSupport', () => {
    beforeEach(() => {
        mockServer.reset()
    })
    const payload = {
        productType: 'Product Type',
        accountDomain: 'example.com',
        userEmail: 'test@example.com',
        primaryReason: 'Primary Reason',
        secondaryReason: 'Secondary Reason',
        otherReason: null,
        correspondingChurnMitigationOfferId: 'OfferId',
    }

    it('should send accepted churn mitigation offer to support successfully', async () => {
        mockServer
            .onPost(CHURN_MITIGATION_OFFER_ZAPIER_URL)
            .reply(200, {success: true})

        const result = await sendAcceptedChurnMitigationOfferToSupport(payload)

        expect(result).toBe(true)
    })

    it('should handle failure when sending churn mitigation offer to support', async () => {
        mockServer
            .onPost(CHURN_MITIGATION_OFFER_ZAPIER_URL)
            .reply(400, {random: 'Response'})

        const result = await sendAcceptedChurnMitigationOfferToSupport(payload)

        expect(result).toBe(false)
    })
})
