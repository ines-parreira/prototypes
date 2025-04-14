import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'

import { fetchEcommerceItemByExternalId } from '../resources'
import { mockEcommerceData } from './mocks'

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
})
