import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'

import {shopifyIntegration} from 'fixtures/integrations'
import {integrationDataItemProductFixture} from 'fixtures/shopify'
import client from 'models/api/resources'

import {CAMPAIGN_TEMPLATES} from '../index'

jest.mock('ulidx', () => ({
    ulid: jest.fn(() => 'ulid-generated-id'),
}))

describe('CampaignTemplates', () => {
    let mockServer: MockAdapter

    const orderedTemplates = Object.values(CAMPAIGN_TEMPLATES).sort((a, b) =>
        a.slug < b.slug ? -1 : 1
    )
    const templatesWithPostSave = orderedTemplates.filter(
        (template) => template.postSave
    )

    beforeEach(() => {
        mockServer = new MockAdapter(client)
    })

    afterEach(() => {
        mockServer.restore()
    })

    it.each(orderedTemplates)(
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
                .reply(201, {code: 'test-code'})
            mockServer
                .onGet(`/api/integrations/${shopifyIntegration.id}/product/`)
                .reply(200, {data: [integrationDataItemProductFixture()]})

            const configuration = await template.getConfiguration(
                fromJS(shopifyIntegration),
                fromJS({})
            )
            expect(configuration).toMatchSnapshot()

            if (template.getWizardConfiguration) {
                const wizardConfiguration = template.getWizardConfiguration()
                expect(wizardConfiguration).toMatchSnapshot()
            }

            if (template.postSave) {
                await template.postSave(fromJS(shopifyIntegration), fromJS({}))
                expect(mockServer.history.post.length).toBe(1)
            }
        }
    )

    it.each(templatesWithPostSave)(
        'should raise exception if cannot create discout code',
        async (template) => {
            mockServer
                .onGet(`/api/discount-codes/${shopifyIntegration.id}/`)
                .reply(200, {
                    data: [],
                    meta: {},
                })
            mockServer
                .onPost(`/api/discount-codes/${shopifyIntegration.id}/`)
                .reply(500, {})

            if (template.postSave) {
                await expect(
                    template.postSave(fromJS(shopifyIntegration), fromJS({}))
                ).resolves.toBe(false)
            }
        }
    )
})
