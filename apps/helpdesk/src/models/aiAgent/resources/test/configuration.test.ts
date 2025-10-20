import { assumeMock } from '@repo/testing'
import MockAdapter from 'axios-mock-adapter'

import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'

import {
    apiClient,
    optOutSalesTrialUpgrade,
    startSalesTrial,
} from '../configuration'

jest.mock('utils/gorgiasAppsAuth', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const mockedGorgiasAppsAuthInterceptor = assumeMock(gorgiasAppsAuthInterceptor)
const mock = new MockAdapter(apiClient)

describe('Sales configuration endpoints', () => {
    beforeEach(() => {
        const mockInterceptor = jest.fn((config: any) => {
            config.headers.Authorization = 'Bearer mock-token'
            return Promise.resolve(config)
        })
        mockedGorgiasAppsAuthInterceptor.mockImplementation(mockInterceptor)
    })

    afterEach(() => {
        mock.reset()
    })

    describe('startSalesTrial', () => {
        it('should call the correct endpoint with the provided parameters', async () => {
            const gorgiasDomain = 'test-domain'
            const storeType = 'shopify'
            const storeName = 'test-store'
            const expectedResponse = { success: true }

            mock.onPost(
                `/config/accounts/${gorgiasDomain}/sales/${storeType}/${storeName}/start-trial`,
            ).reply(200, expectedResponse)

            const result = await startSalesTrial(
                gorgiasDomain,
                storeType,
                storeName,
            )

            expect(result).toEqual(expectedResponse)
            expect(mock.history.post.length).toBe(1)
            expect(mock.history.post[0].url).toBe(
                `/config/accounts/${gorgiasDomain}/sales/${storeType}/${storeName}/start-trial`,
            )
        })
    })

    describe('optOutSalesTrialUpgrade', () => {
        it('should call the correct endpoint', async () => {
            const gorgiasDomain = 'test-domain'
            const expectedResponse = { success: true }

            mock.onPost(
                `/config/accounts/${gorgiasDomain}/sales/opt-out-trial-upgrade`,
            ).reply(200, expectedResponse)

            const result = await optOutSalesTrialUpgrade(gorgiasDomain)

            expect(result).toEqual(expectedResponse)
            expect(mock.history.post.length).toBe(1)
            expect(mock.history.post[0].url).toBe(
                `/config/accounts/${gorgiasDomain}/sales/opt-out-trial-upgrade`,
            )
        })
    })
})
