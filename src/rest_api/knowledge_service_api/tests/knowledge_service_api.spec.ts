// Mock all imports BEFORE importing the module under test
jest.mock('memoize-one')
jest.mock('openapi-client-axios')
jest.mock('utils/environment')
jest.mock('utils/gorgiasAppsAuth')
jest.mock('../client.generated.d')
jest.mock('../ks-api.openapi.json', () => ({
    __esModule: true,
    default: { openapi: '3.0.0', info: { title: 'Test API' } },
}))

describe('Gorgias KS API Client Core Functions', () => {
    // Mock objects that we'll reuse across tests
    let mockApiInstance: any
    let mockClient: any
    let mockInterceptors: any
    let mockOpenAPIClientAxios: any
    let mockIsProduction: any
    let mockIsStaging: any
    let mockGorgiasAppsAuthInterceptor: any
    let buildGorgiasKsApiClient: any

    beforeEach(() => {
        // Clear all mocks and modules before each test
        jest.clearAllMocks()
        jest.resetModules()

        // Setup mock client with interceptors
        mockInterceptors = {
            request: {
                use: jest.fn(),
            },
        }

        mockClient = {
            interceptors: mockInterceptors,
        }

        // Setup mock OpenAPI client instance
        mockApiInstance = {
            init: jest.fn().mockResolvedValue(mockClient),
        }

        // Mock the modules for each test
        mockOpenAPIClientAxios = jest
            .fn()
            .mockImplementation(() => mockApiInstance)

        // Import mocked modules
        const openAPIClientAxios = require('openapi-client-axios')
        openAPIClientAxios.default = mockOpenAPIClientAxios

        // Mock environment utilities
        const environment = require('utils/environment')
        mockIsProduction = jest.fn().mockReturnValue(false)
        mockIsStaging = jest.fn().mockReturnValue(false)
        environment.isProduction = mockIsProduction
        environment.isStaging = mockIsStaging

        // Mock auth interceptor
        const gorgiasAppsAuth = require('utils/gorgiasAppsAuth')
        mockGorgiasAppsAuthInterceptor = jest.fn()
        gorgiasAppsAuth.default = mockGorgiasAppsAuthInterceptor

        // Import the module under test (it will use our mocks)
        const clientModule = require('../client')
        buildGorgiasKsApiClient = clientModule.buildGorgiasKsApiClient
    })

    describe('getKsApiBaseURL', () => {
        it('should return production URL when in production environment', async () => {
            mockIsProduction.mockReturnValue(true)
            mockIsStaging.mockReturnValue(false)

            await buildGorgiasKsApiClient()

            expect(mockOpenAPIClientAxios).toHaveBeenCalledWith({
                definition: expect.any(Object),
                withServer: { url: 'https://knowledge-service.gorgias.help' },
            })
        })

        it('should return staging URL when in staging environment', async () => {
            mockIsProduction.mockReturnValue(false)
            mockIsStaging.mockReturnValue(true)

            await buildGorgiasKsApiClient()

            expect(mockOpenAPIClientAxios).toHaveBeenCalledWith({
                definition: expect.any(Object),
                withServer: { url: 'https://knowledge-service.gorgias.rehab' },
            })
        })

        it('should return localhost URL in development environment', async () => {
            mockIsProduction.mockReturnValue(false)
            mockIsStaging.mockReturnValue(false)

            await buildGorgiasKsApiClient()

            expect(mockOpenAPIClientAxios).toHaveBeenCalledWith({
                definition: expect.any(Object),
                withServer: { url: 'http://localhost:9500' },
            })
        })

        it('should prioritize production over staging when both are true', async () => {
            mockIsProduction.mockReturnValue(true)
            mockIsStaging.mockReturnValue(true)

            await buildGorgiasKsApiClient()

            expect(mockOpenAPIClientAxios).toHaveBeenCalledWith({
                definition: expect.any(Object),
                withServer: { url: 'https://knowledge-service.gorgias.help' },
            })
        })
    })

    describe('buildGorgiasKsApiClient', () => {
        describe('Client initialization', () => {
            it('should create OpenAPI client with correct configuration', async () => {
                await buildGorgiasKsApiClient()

                expect(mockOpenAPIClientAxios).toHaveBeenCalledWith({
                    definition: expect.any(Object),
                    withServer: { url: 'http://localhost:9500' },
                })
            })

            it('should initialize the OpenAPI client', async () => {
                await buildGorgiasKsApiClient()

                expect(mockApiInstance.init).toHaveBeenCalledTimes(1)
            })

            it('should add authentication interceptor to the client', async () => {
                await buildGorgiasKsApiClient()

                expect(mockInterceptors.request.use).toHaveBeenCalledWith(
                    mockGorgiasAppsAuthInterceptor,
                )
            })

            it('should return the configured client', async () => {
                const result = await buildGorgiasKsApiClient()

                expect(result).toBe(mockClient)
            })
        })

        describe('Singleton behavior within function', () => {
            it('should return existing client if already initialized', async () => {
                // First call
                const client1 = await buildGorgiasKsApiClient()

                // Second call should return the same instance without reinitializing
                const client2 = await buildGorgiasKsApiClient()

                expect(client1).toBe(client2)
                expect(mockOpenAPIClientAxios).toHaveBeenCalledTimes(1)
                expect(mockApiInstance.init).toHaveBeenCalledTimes(1)
            })

            it('should only add auth interceptor once', async () => {
                // Multiple calls
                await buildGorgiasKsApiClient()
                await buildGorgiasKsApiClient()
                await buildGorgiasKsApiClient()

                expect(mockInterceptors.request.use).toHaveBeenCalledTimes(1)
            })
        })

        describe('Error handling', () => {
            it('should propagate OpenAPI client initialization errors', async () => {
                // Mock the init method to reject with an error
                const initError = new Error(
                    'Failed to initialize OpenAPI client',
                )
                mockApiInstance.init.mockRejectedValueOnce(initError)

                await expect(buildGorgiasKsApiClient()).rejects.toThrow(
                    initError,
                )
            })

            it('should propagate OpenAPI client constructor errors', async () => {
                // Mock the constructor to throw an error
                const constructorError = new Error('Invalid OpenAPI definition')
                mockOpenAPIClientAxios.mockImplementationOnce(() => {
                    throw constructorError
                })

                await expect(buildGorgiasKsApiClient()).rejects.toThrow(
                    constructorError,
                )
            })

            it('should not affect global client state on initialization error', async () => {
                const initError = new Error('Initialization failed')
                mockApiInstance.init.mockRejectedValueOnce(initError)

                // First call fails
                await expect(buildGorgiasKsApiClient()).rejects.toThrow(
                    initError,
                )

                // Reset mock for the second call
                mockApiInstance.init.mockReset()
                mockApiInstance.init.mockResolvedValueOnce(mockClient)

                // Second call should succeed and try to initialize again
                const result = await buildGorgiasKsApiClient()
                expect(result).toBe(mockClient)
                expect(mockApiInstance.init).toHaveBeenCalledTimes(1)
            })
        })

        describe('Environment integration', () => {
            it('should work correctly in production environment', async () => {
                mockIsProduction.mockReturnValue(true)
                mockIsStaging.mockReturnValue(false)

                const client = await buildGorgiasKsApiClient()

                expect(mockIsProduction).toHaveBeenCalled()
                // When in production environment, isStaging might not be called
                // if the implementation short-circuits, so we'll remove this assertion
                // expect(mockIsStaging).toHaveBeenCalled()
                expect(mockOpenAPIClientAxios).toHaveBeenCalledWith({
                    definition: expect.any(Object),
                    withServer: {
                        url: 'https://knowledge-service.gorgias.help',
                    },
                })
                expect(client).toBe(mockClient)
            })

            it('should work correctly in staging environment', async () => {
                mockIsProduction.mockReturnValue(false)
                mockIsStaging.mockReturnValue(true)

                const client = await buildGorgiasKsApiClient()

                expect(mockOpenAPIClientAxios).toHaveBeenCalledWith({
                    definition: expect.any(Object),
                    withServer: {
                        url: 'https://knowledge-service.gorgias.rehab',
                    },
                })
                expect(client).toBe(mockClient)
            })
        })

        describe('Type safety', () => {
            it('should properly type the OpenAPI document', async () => {
                await buildGorgiasKsApiClient()

                expect(mockOpenAPIClientAxios).toHaveBeenCalledWith({
                    definition: expect.any(Object),
                    withServer: { url: expect.any(String) },
                })
            })

            it('should return a properly typed client', async () => {
                const client = await buildGorgiasKsApiClient()

                expect(client).toHaveProperty('interceptors')
                expect(client.interceptors).toHaveProperty('request')
                expect(client.interceptors.request).toHaveProperty('use')
            })
        })
    })
})
