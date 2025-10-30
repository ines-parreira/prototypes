import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'

import {
    fetchEcommerceItemByExternalId,
    fetchEcommerceLookupValues,
    fetchEcommerceProductCollections,
    fetchEcommerceProducts,
    updateProductAdditionalInfo,
} from '../resources'
import {
    AdditionalInfoKey,
    AdditionalInfoObjectType,
    AdditionalInfoSourceType,
} from '../types'
import {
    mockEcommerceData,
    mockEcommerceItem,
    mockEcommerceProductTags,
    mockEcommerceVendors,
    mockProductCollections,
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

    describe('fetchEcommerceProductCollections', () => {
        it('should fetch product collections', async () => {
            const integrationId = 123

            mockedServer
                .onGet(`/api/ecommerce/product_collection/shopify`, {
                    params: {
                        integration_id: integrationId,
                    },
                })
                .reply(200, {
                    data: mockProductCollections,
                    metadata: {
                        next_cursor: 'next-cursor',
                        prev_cursor: 'prev-cursor',
                    },
                })

            const result = await fetchEcommerceProductCollections(integrationId)

            expect(result.data.data).toEqual(mockProductCollections)
            expect(result.data.metadata).toEqual({
                next_cursor: 'next-cursor',
                prev_cursor: 'prev-cursor',
            })
        })

        it('should handle error when fetching product collections', async () => {
            const integrationId = 123

            mockedServer
                .onGet(`/api/ecommerce/product_collection/shopify`, {
                    params: {
                        integration_id: integrationId,
                    },
                })
                .reply(500, { message: 'error' })

            return expect(
                fetchEcommerceProductCollections(integrationId),
            ).rejects.toEqual(new Error('Request failed with status code 500'))
        })
    })

    describe('updateProductAdditionalInfo', () => {
        it('should update product additional information', async () => {
            const objectType = AdditionalInfoObjectType.PRODUCT
            const sourceType = AdditionalInfoSourceType.SHOPIFY
            const integrationId = 123
            const externalId = 'ext-456'
            const key = AdditionalInfoKey.AI_AGENT_EXTENDED_CONTEXT
            const data = {
                data: {
                    rich_text: '<p>Additional product information</p>',
                },
                version: new Date().toISOString(),
            }

            mockedServer
                .onPut(
                    `/api/ecommerce/${objectType}/${sourceType}/${integrationId}/${externalId}/additional-info/${key}`,
                    data,
                )
                .reply(200, data)

            const result = await updateProductAdditionalInfo(
                objectType,
                sourceType,
                integrationId,
                externalId,
                key,
                data,
            )

            expect(result.data).toEqual(data)
        })

        it('should handle error when updating product additional information', async () => {
            const objectType = AdditionalInfoObjectType.PRODUCT
            const sourceType = AdditionalInfoSourceType.SHOPIFY
            const integrationId = 123
            const externalId = 'ext-456'
            const key = AdditionalInfoKey.AI_AGENT_EXTENDED_CONTEXT
            const data = {
                data: {
                    rich_text: '<p>Additional product information</p>',
                },
                version: new Date().toISOString(),
            }

            mockedServer
                .onPut(
                    `/api/ecommerce/${objectType}/${sourceType}/${integrationId}/${externalId}/additional-info/${key}`,
                )
                .reply(500, { message: 'error' })

            return expect(
                updateProductAdditionalInfo(
                    objectType,
                    sourceType,
                    integrationId,
                    externalId,
                    key,
                    data,
                ),
            ).rejects.toEqual(new Error('Request failed with status code 500'))
        })
    })
})
