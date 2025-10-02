import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'

import {
    fetchEcommerceItemByExternalId,
    fetchEcommerceLookupValues,
    fetchEcommerceProducts,
} from '../resources'
import {
    mockEcommerceData,
    mockEcommerceItem,
    mockEcommerceProductTags,
    mockEcommerceVendors,
} from './mocks'

jest.mock('utils/gorgiasAppsAuth', () => ({
    gorgiasAppsAuthInterceptor: jest.fn().mockImplementation((config) => {
        config.headers = {
            ...config.headers,
            Authorization: 'Bearer mock-token',
        }
        return config
    }),
}))

const mockedServer = new MockAdapter(client)

describe('Ecommerce Resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchEcommerceItemByExternalId', () => {
        it('should fetch ecommerce item by external ID', async () => {
            const objectType = 'product'
            const sourceType = 'shopify'
            const integrationId = 123
            const externalId = 'ext-456'

            mockedServer
                .onGet(
                    `/api/ecommerce/${objectType}/${sourceType}/${integrationId}/${externalId}`,
                )
                .reply(200, mockEcommerceData)

            const result = await fetchEcommerceItemByExternalId(
                objectType,
                sourceType,
                integrationId,
                externalId,
            )
            expect(result.data).toEqual(mockEcommerceData)
        })

        it('should handle error when fetching ecommerce item by external ID', async () => {
            const objectType = 'product'
            const sourceType = 'shopify'
            const integrationId = 123
            const externalId = 'ext-456'

            mockedServer
                .onGet(
                    `/api/ecommerce/${objectType}/${sourceType}/${integrationId}/${externalId}`,
                )
                .reply(500, { message: 'error' })

            return expect(
                fetchEcommerceItemByExternalId(
                    objectType,
                    sourceType,
                    integrationId,
                    externalId,
                ),
            ).rejects.toEqual(new Error('Request failed with status code 500'))
        })
    })

    describe('fetchEcommerceLookupValues', () => {
        it('should fetch product tags', async () => {
            const integrationId = 123

            mockedServer
                .onGet(
                    `/api/ecommerce/lookup_values/product_tag/shopify/${integrationId}`,
                )
                .reply(200, {
                    data: mockEcommerceProductTags,
                    metadata: {
                        next_cursor: 'next-cursor',
                        prev_cursor: 'prev-cursor',
                    },
                })

            const result = await fetchEcommerceLookupValues(
                'product_tag',
                integrationId,
            )

            expect(result.data.data).toEqual(mockEcommerceProductTags)
            expect(result.data.metadata).toEqual({
                next_cursor: 'next-cursor',
                prev_cursor: 'prev-cursor',
            })
        })

        it('should handle error when fetching product tags', async () => {
            const integrationId = 123

            mockedServer
                .onGet(
                    `/api/ecommerce/lookup_values/product_tag/shopify/${integrationId}`,
                )
                .reply(500, { message: 'error' })

            return expect(
                fetchEcommerceLookupValues('product_tag', integrationId),
            ).rejects.toEqual(new Error('Request failed with status code 500'))
        })

        it('should fetch vendors', async () => {
            const integrationId = 123

            mockedServer
                .onGet(
                    `/api/ecommerce/lookup_values/vendor/shopify/${integrationId}`,
                )
                .reply(200, {
                    data: mockEcommerceVendors,
                    metadata: {
                        next_cursor: 'next-cursor',
                        prev_cursor: 'prev-cursor',
                    },
                })

            const result = await fetchEcommerceLookupValues(
                'vendor',
                integrationId,
            )

            expect(result.data.data).toEqual(mockEcommerceVendors)
            expect(result.data.metadata).toEqual({
                next_cursor: 'next-cursor',
                prev_cursor: 'prev-cursor',
            })
        })

        it('should handle error when fetching product vendors', async () => {
            const integrationId = 123

            mockedServer
                .onGet(
                    `/api/ecommerce/lookup_values/vendor/shopify/${integrationId}`,
                )
                .reply(500, { message: 'error' })

            return expect(
                fetchEcommerceLookupValues('vendor', integrationId),
            ).rejects.toEqual(new Error('Request failed with status code 500'))
        })
    })

    describe('fetchEcommerceProducts', () => {
        it('should fetch products', async () => {
            const integrationId = 123

            mockedServer
                .onGet(`/api/ecommerce/product/shopify`, {
                    params: {
                        integration_id: integrationId,
                    },
                })
                .reply(200, {
                    data: [
                        mockEcommerceItem,
                        mockEcommerceItem,
                        mockEcommerceItem,
                    ],
                    metadata: {
                        next_cursor: 'next-cursor',
                        prev_cursor: 'prev-cursor',
                    },
                })

            const result = await fetchEcommerceProducts(integrationId)

            expect(result.data.data).toEqual([
                mockEcommerceItem,
                mockEcommerceItem,
                mockEcommerceItem,
            ])
            expect(result.data.metadata).toEqual({
                next_cursor: 'next-cursor',
                prev_cursor: 'prev-cursor',
            })
        })

        it('should handle error when fetching products', async () => {
            const integrationId = 123

            mockedServer
                .onGet(`/api/ecommerce/product/shopify`, {
                    params: {
                        integration_id: integrationId,
                    },
                })
                .reply(500, { message: 'error' })

            return expect(
                fetchEcommerceProducts(integrationId),
            ).rejects.toEqual(new Error('Request failed with status code 500'))
        })
    })
})
