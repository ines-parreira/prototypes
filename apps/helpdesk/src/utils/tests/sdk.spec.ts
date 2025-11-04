import { assumeMock } from '@repo/testing'
import { isProduction, isStaging } from '@repo/utils'
import { setupServer } from 'msw/node'

import { getAbTest } from '@gorgias/convert-client'
import { mockGetAbTestHandler } from '@gorgias/convert-mocks'
import { listEcommerceData } from '@gorgias/ecommerce-storage-client'
import { mockListEcommerceDataHandler } from '@gorgias/ecommerce-storage-mocks'
import { listTickets } from '@gorgias/helpdesk-client'
import { mockListTicketsHandler } from '@gorgias/helpdesk-mocks'
import { findFeedback } from '@gorgias/knowledge-service-client'
import { mockFindFeedbackHandler } from '@gorgias/knowledge-service-mocks'

import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'

import { initSDKs } from '../sdk'

jest.mock('utils/gorgiasAppsAuth')
jest.mock('@repo/utils')

const interceptorMock = assumeMock(gorgiasAppsAuthInterceptor)
const isProductionMock = assumeMock(isProduction)
const isStagingMock = assumeMock(isStaging)

describe('initSDKs()', () => {
    const server = setupServer()

    beforeAll(() => {
        server.listen()

        interceptorMock.mockImplementation((config) => {
            config.headers.Authorization = 'Bearer mock-token'
            return Promise.resolve(config)
        })
    })

    beforeEach(() => {
        server.use(mockFindFeedbackHandler().handler)
        server.use(mockListTicketsHandler().handler)
        server.use(mockListEcommerceDataHandler().handler)
        server.use(mockGetAbTestHandler().handler)
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    describe('helpdesk', () => {
        it('should set the X-CSRF-Token and X-Gorgias-User-Client headers', async () => {
            initSDKs()

            const response = await listTickets()

            expect(response.config.headers).toEqual(
                expect.objectContaining({
                    'X-CSRF-Token': window.CSRF_TOKEN,
                    'X-Gorgias-User-Client': 'web',
                }),
            )
        })
    })

    describe('ecommerce-storage', () => {
        it('should attach the request interceptor for authorization handling', async () => {
            initSDKs()

            const response = await listEcommerceData('cart', 'shopify', {
                params: { ids: ['1', '2', '3'] },
            })

            expect(response.config.headers).toEqual(
                expect.objectContaining({
                    Authorization: 'Bearer mock-token',
                }),
            )
        })
    })

    describe('convert', () => {
        describe('should set the base URL based on the environment', () => {
            it('for production', async () => {
                isProductionMock.mockReturnValue(true)
                isStagingMock.mockReturnValue(false)

                initSDKs()

                const response = await getAbTest('1')

                expect(response.config.baseURL).toBe(
                    'https://gorgias-convert.com',
                )
            })

            it('for staging', async () => {
                isProductionMock.mockReturnValue(false)
                isStagingMock.mockReturnValue(true)

                initSDKs()

                const response = await getAbTest('1')

                expect(response.config.baseURL).toBe(
                    'https://staging.gorgias-convert.com',
                )
            })

            it('for development', async () => {
                isProductionMock.mockReturnValue(false)
                isStagingMock.mockReturnValue(false)

                initSDKs()

                const response = await getAbTest('1')

                expect(response.config.baseURL).toBe(
                    'http://acme.gorgias.docker:8095',
                )
            })
        })
    })

    describe('knowledge-service', () => {
        describe('should set the base URL based on the environment', () => {
            it('for production', async () => {
                isProductionMock.mockReturnValue(true)
                isStagingMock.mockReturnValue(false)

                initSDKs()

                const response = await findFeedback({
                    objectId: '1',
                    objectType: 'TICKET',
                })

                expect(response.config.baseURL).toBe(
                    'https://knowledge-service.gorgias.help',
                )
            })

            it('for staging', async () => {
                isProductionMock.mockReturnValue(false)
                isStagingMock.mockReturnValue(true)

                initSDKs()

                const response = await findFeedback({
                    objectId: '1',
                    objectType: 'TICKET',
                })

                expect(response.config.baseURL).toBe(
                    'https://knowledge-service.gorgias.rehab',
                )
            })

            it('for development', async () => {
                isProductionMock.mockReturnValue(false)
                isStagingMock.mockReturnValue(false)

                initSDKs()

                const response = await findFeedback({
                    objectId: '1',
                    objectType: 'TICKET',
                })

                expect(response.config.baseURL).toBe('http://localhost:9500')
            })
        })

        it('should attach the request interceptor for Authorization handling', async () => {
            initSDKs()

            const response = await findFeedback({
                objectId: '1',
                objectType: 'TICKET',
            })

            expect(response.config.headers).toEqual(
                expect.objectContaining({
                    Authorization: 'Bearer mock-token',
                }),
            )
        })
    })
})
