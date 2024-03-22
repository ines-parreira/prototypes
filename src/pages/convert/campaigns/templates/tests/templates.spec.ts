import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {shopifyIntegration} from 'fixtures/integrations'
import client from 'models/api/resources'
import {integrationDataItemProductFixture} from 'fixtures/shopify'
import {CAMPAIGN_TEMPLATES} from '../index'

jest.mock('ulidx', () => ({
    ulid: jest.fn(() => 'ulid-generated-id'),
}))

describe('CampaignTemplates', () => {
    let mockServer: MockAdapter

    beforeEach(() => {
        mockServer = new MockAdapter(client)
    })

    it.each(Object.values(CAMPAIGN_TEMPLATES))(
        'get template configuration',
        async (template) => {
            mockServer
                .onGet(`/api/discount-codes/${shopifyIntegration.id}/`)
                .reply(200, {
                    data: [],
                    meta: {},
                })
            mockServer
                .onPost(`/api/discount-codes/${shopifyIntegration.id}/`)
                .reply(200, {code: 'test-code'})
            mockServer
                .onGet(`/api/integrations/${shopifyIntegration.id}/product/`)
                .reply(200, {data: [integrationDataItemProductFixture()]})

            const configuration = await template.getConfiguration(
                fromJS(shopifyIntegration),
                fromJS({})
            )
            expect(configuration).toMatchSnapshot()
        }
    )
})
