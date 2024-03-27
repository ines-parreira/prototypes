import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {shopifyIntegration} from 'fixtures/integrations'
import client from 'models/api/resources'
import {integrationDataItemProductFixture} from 'fixtures/shopify'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {CampaignConfigurationBuilder} from '../constructor'
import {CART_ABANDONMENT} from '../onboarding/cartAbandonment'

const configuration = {
    name: CART_ABANDONMENT.name,
    template_id: CART_ABANDONMENT.slug,
    message_text: `Test text message`,
    message_html: `<div>Test html message</div>`,
    status: CampaignStatus.Inactive,
    triggers: [],
    trigger_rule: '',
}

describe('CampaignConfigurationBuilder', () => {
    let mockServer: MockAdapter

    beforeEach(() => {
        mockServer = new MockAdapter(client)
    })

    it('attachProductCards', async () => {
        mockServer
            .onGet(`/api/integrations/${shopifyIntegration.id}/product/`)
            .reply(200, {
                data: [
                    integrationDataItemProductFixture(),
                    integrationDataItemProductFixture(),
                    integrationDataItemProductFixture(),
                    integrationDataItemProductFixture(),
                ],
            })

        const b = new CampaignConfigurationBuilder(
            CART_ABANDONMENT,
            configuration
        )

        await b.attachProductCards(fromJS(shopifyIntegration), 3)

        const data = b.build()

        expect(data.attachments?.length).toBe(3)
        expect(mockServer.history.get).toHaveLength(1)
    })

    it('getOrCreateDiscountCode', async () => {
        const existingCode = 'test-code'

        mockServer
            .onGet(`/api/discount-codes/${shopifyIntegration.id}/`)
            .reply(200, {data: []})
        mockServer
            .onPost(`/api/discount-codes/${shopifyIntegration.id}/`)
            .reply(200, {code: existingCode})

        const code = await CampaignConfigurationBuilder.getOrCreateDiscountCode(
            fromJS(shopifyIntegration),
            'percentage',
            'TESTCODE',
            0.1
        )

        expect(code).toBe(existingCode)
        expect(mockServer.history.get).toHaveLength(1)
        expect(mockServer.history.post).toHaveLength(1)
    })
})
