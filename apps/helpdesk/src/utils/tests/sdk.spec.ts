import { gorgiasAppsAuthInterceptor } from '@repo/api-resources'
import { GorgiasAppAuthService } from '@repo/api-resources/gorgiasAppsAuth'
import { assumeMock } from '@repo/testing'
import { isLocalDev, isProduction, isStaging } from '@repo/utils'
import { setupServer } from 'msw/node'

import { getAbTest } from '@gorgias/convert-client'
import { mockGetAbTestHandler } from '@gorgias/convert-mocks'
import { GorgiasCopilotAgent } from '@gorgias/copilot'
import { listEcommerceData } from '@gorgias/ecommerce-storage-client'
import { mockListEcommerceDataHandler } from '@gorgias/ecommerce-storage-mocks'
import { listTickets } from '@gorgias/helpdesk-client'
import { mockListTicketsHandler } from '@gorgias/helpdesk-mocks'
import { findFeedback } from '@gorgias/knowledge-service-client'
import { mockFindFeedbackHandler } from '@gorgias/knowledge-service-mocks'

import { getStoresConfigurations } from 'models/aiAgent/resources/configuration'
import type { StoreConfiguration } from 'models/aiAgent/types'

import {
    copilotAppsAuthInterceptor,
    createCopilotAgent,
    fetchCopilotShops,
    initSDKs,
} from '../sdk'

jest.mock('@repo/api-resources')
jest.mock('@repo/utils')
jest.mock('models/aiAgent/resources/configuration', () => ({
    getStoresConfigurations: jest.fn(),
}))

const interceptorMock = assumeMock(gorgiasAppsAuthInterceptor)
const isProductionMock = assumeMock(isProduction)
const isStagingMock = assumeMock(isStaging)
const isLocalDevMock = assumeMock(isLocalDev)
const gorgiasCopilotAgentMock = assumeMock(GorgiasCopilotAgent)
const getStoresConfigurationsMock = assumeMock(getStoresConfigurations)

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

    describe('createCopilotAgent', () => {
        it('builds the agent with the same-origin base URL in development', () => {
            gorgiasCopilotAgentMock.mockClear()
            isProductionMock.mockReturnValue(false)
            isStagingMock.mockReturnValue(false)

            createCopilotAgent()

            expect(gorgiasCopilotAgentMock.mock.calls[0][0]).toEqual(
                expect.objectContaining({
                    baseUrl: '/api/copilot',
                    getToken: expect.any(Function),
                    onTokenInvalid: expect.any(Function),
                }),
            )
        })

        it('builds the agent with the production base URL', () => {
            gorgiasCopilotAgentMock.mockClear()
            isProductionMock.mockReturnValue(true)
            isStagingMock.mockReturnValue(false)

            createCopilotAgent()

            expect(gorgiasCopilotAgentMock.mock.calls[0][0].baseUrl).toBe(
                'https://copilot.gorgias.help/api/copilot',
            )
        })

        it('builds the agent with the staging base URL', () => {
            gorgiasCopilotAgentMock.mockClear()
            isProductionMock.mockReturnValue(false)
            isStagingMock.mockReturnValue(true)

            createCopilotAgent()

            expect(gorgiasCopilotAgentMock.mock.calls[0][0].baseUrl).toBe(
                'https://copilot.gorgias.rehab/api/copilot',
            )
        })

        it('builds the agent with the local dev base URL', () => {
            gorgiasCopilotAgentMock.mockClear()
            isProductionMock.mockReturnValue(false)
            isStagingMock.mockReturnValue(false)
            isLocalDevMock.mockReturnValue(true)

            createCopilotAgent()

            expect(gorgiasCopilotAgentMock.mock.calls[0][0].baseUrl).toBe(
                'https://copilot.gorgias.localhost/api/copilot',
            )
        })

        it('wires getToken and onTokenInvalid to the copilot auth service', async () => {
            gorgiasCopilotAgentMock.mockClear()
            const getRawAccessTokenSpy = jest
                .spyOn(GorgiasAppAuthService.prototype, 'getRawAccessToken')
                .mockResolvedValue('copilot-token')
            const clearAccessTokenSpy = jest
                .spyOn(GorgiasAppAuthService.prototype, 'clearAccessToken')
                .mockImplementation(() => undefined)

            createCopilotAgent()
            const config = gorgiasCopilotAgentMock.mock.calls[0][0]

            await expect(config.getToken()).resolves.toBe('copilot-token')
            config.onTokenInvalid()

            expect(getRawAccessTokenSpy).toHaveBeenCalledTimes(1)
            expect(clearAccessTokenSpy).toHaveBeenCalledTimes(1)

            getRawAccessTokenSpy.mockRestore()
            clearAccessTokenSpy.mockRestore()
        })
    })

    describe('copilotAppsAuthInterceptor', () => {
        it('sets the copilot-scoped authorization header on the request', async () => {
            const getAccessTokenSpy = jest
                .spyOn(GorgiasAppAuthService.prototype, 'getAccessToken')
                .mockResolvedValue('Bearer copilot-token')

            const setAuthorization = jest.fn()
            const config = {
                headers: { setAuthorization },
            } as unknown as Parameters<typeof copilotAppsAuthInterceptor>[0]

            const result = await copilotAppsAuthInterceptor(config)

            expect(getAccessTokenSpy).toHaveBeenCalledTimes(1)
            expect(setAuthorization).toHaveBeenCalledWith(
                'Bearer copilot-token',
            )
            expect(result).toBe(config)

            getAccessTokenSpy.mockRestore()
        })
    })

    describe('fetchCopilotShops', () => {
        it('maps store configurations to copilot shops', async () => {
            getStoresConfigurationsMock.mockResolvedValue({
                storeConfigurations: [
                    { storeName: 'shop-a' },
                    { storeName: 'shop-b' },
                ] as StoreConfiguration[],
            })

            const shops = await fetchCopilotShops({ accountDomain: 'acme' })

            expect(getStoresConfigurationsMock).toHaveBeenCalledWith('acme', {
                withWizard: false,
                withFloatingInput: false,
            })
            expect(shops).toEqual([
                { name: 'shop-a', label: 'shop-a' },
                { name: 'shop-b', label: 'shop-b' },
            ])
        })
    })
})
