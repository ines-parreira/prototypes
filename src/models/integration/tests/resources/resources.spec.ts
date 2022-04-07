import MockAdapter from 'axios-mock-adapter'

import {ShopifyTags} from 'models/integration/types'
import {fetchShopTags} from 'models/integration/resources/shopify'
import client from '../../../api/resources'

const mockedServer = new MockAdapter(client)

describe('Shopify shop tag resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchShopTags()', () => {
        it('should fetch shop Customer tags', async () => {
            const integrationId = 1
            const tagsType = ShopifyTags.customers
            const response = {
                data: {shop: {customerTags: {edges: [{node: 'test-tag'}]}}},
            }
            const expectedResult = ['test-tag']

            mockedServer
                .onGet(`integrations/shopify/shop-tags/${tagsType}/list/`)
                .reply(200, response)

            const result = await fetchShopTags(integrationId, tagsType)

            expect(result).toEqual(expectedResult)
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should fetch shop Order tags', async () => {
            const integrationId = 1
            const tagsType = ShopifyTags.orders
            const response = {
                data: {shop: {orderTags: {edges: [{node: 'test-tag'}]}}},
            }
            const expectedResult = ['test-tag']

            mockedServer
                .onGet(`integrations/shopify/shop-tags/${tagsType}/list/`)
                .reply(200, response)

            const result = await fetchShopTags(integrationId, tagsType)

            expect(result).toEqual(expectedResult)
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should raise an error', async () => {
            const integrationId = 1
            const tagsType = ShopifyTags.orders

            mockedServer
                .onGet(`integrations/shopify/shop-tags/${tagsType}/list/`)
                .reply(500, {message: 'error'})

            return expect(
                fetchShopTags(integrationId, tagsType)
            ).rejects.toEqual(new Error('Request failed with status code 500'))
        })
    })
})
