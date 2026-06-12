import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateOrUpdateStoreConfigurationHandler,
    mockCreateOrUpdateStoreConfigurationResponse,
    mockGetStoreConfigurationHandler,
    mockGetStoreConfigurationResponse,
} from '@gorgias/convert-mocks'
import { queryKeys } from '@gorgias/convert-queries'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useAiJourneyStoreConfiguration } from './useAiJourneyStoreConfiguration'

const server = setupServer()
let queryClient = mockQueryClient()

const createWrapper = () => {
    queryClient = mockQueryClient()

    return ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('useAiJourneyStoreConfiguration', () => {
    describe('data fetching', () => {
        it('should return storeConfiguration from the query response', async () => {
            const storeConfiguration = mockGetStoreConfigurationResponse({
                brand_name: 'Test Store',
                sms_sender_integration_id: 1,
                sms_sender_number: '+15550001',
                texas_exclusion_enabled: false,
            })
            server.use(
                mockGetStoreConfigurationHandler(async () =>
                    HttpResponse.json(storeConfiguration),
                ).handler,
            )

            const { result } = renderHook(
                () => useAiJourneyStoreConfiguration(42),
                { wrapper: createWrapper() },
            )

            await waitFor(() => expect(result.current.isFetched).toBe(true))

            expect(result.current.storeConfiguration).toEqual(
                storeConfiguration,
            )
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('should return undefined storeConfiguration while disabled', async () => {
            const requests: Request[] = []
            server.use(
                mockGetStoreConfigurationHandler(async ({ request }) => {
                    requests.push(request)

                    return HttpResponse.json(
                        mockGetStoreConfigurationResponse(),
                    )
                }).handler,
            )

            const { result } = renderHook(
                () => useAiJourneyStoreConfiguration(undefined),
                { wrapper: createWrapper() },
            )

            expect(result.current.storeConfiguration).toBeUndefined()
            expect(result.current.isFetched).toBe(false)
            expect(requests).toHaveLength(0)
        })

        it('should forward query errors', async () => {
            server.use(
                mockGetStoreConfigurationHandler(async () =>
                    HttpResponse.json({ error: 'Network failure' } as never, {
                        status: 500,
                    }),
                ).handler,
            )

            const { result } = renderHook(
                () => useAiJourneyStoreConfiguration(42),
                { wrapper: createWrapper() },
            )

            await waitFor(() => expect(result.current.error).toBeDefined())

            expect(result.current.storeConfiguration).toBeUndefined()
        })
    })

    describe('saveConfiguration', () => {
        it('should call mutateAsync with the storeIntegrationId and configuration data', async () => {
            const updateStoreConfigurationMock =
                mockCreateOrUpdateStoreConfigurationHandler(async () =>
                    HttpResponse.json(
                        mockCreateOrUpdateStoreConfigurationResponse(),
                    ),
                )
            const waitForUpdateStoreConfigurationRequest =
                updateStoreConfigurationMock.waitForRequest(server)
            server.use(
                mockGetStoreConfigurationHandler().handler,
                updateStoreConfigurationMock.handler,
            )

            const configuration = {
                brand_name: 'My Store',
                sms_sender_integration_id: 1,
                sms_sender_number: '+15550001',
                texas_exclusion_enabled: false,
                tone_of_voice_guidance: null,
            }

            const { result } = renderHook(
                () => useAiJourneyStoreConfiguration(42),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.saveConfiguration(configuration)
            })

            await waitForUpdateStoreConfigurationRequest(async (request) => {
                expect(new URL(request.url).pathname).toContain('42')
                expect(await request.json()).toEqual(configuration)
            })
        })

        it('should invalidate the storeConfiguration query after a successful save', async () => {
            server.use(
                mockGetStoreConfigurationHandler().handler,
                mockCreateOrUpdateStoreConfigurationHandler().handler,
            )
            const wrapper = createWrapper()
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            const { result } = renderHook(
                () => useAiJourneyStoreConfiguration(42),
                { wrapper },
            )

            await act(async () => {
                await result.current.saveConfiguration({
                    brand_name: 'Test',
                    tone_of_voice_guidance: null,
                })
            })

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey:
                    queryKeys.storeConfigurations.getStoreConfiguration(42),
            })
        })

        it('should not call mutateAsync when storeIntegrationId is undefined', async () => {
            const requests: Request[] = []
            server.use(
                mockCreateOrUpdateStoreConfigurationHandler(
                    async ({ request }) => {
                        requests.push(request)

                        return HttpResponse.json(
                            mockCreateOrUpdateStoreConfigurationResponse(),
                        )
                    },
                ).handler,
            )

            const { result } = renderHook(
                () => useAiJourneyStoreConfiguration(undefined),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.saveConfiguration({
                    brand_name: 'Test',
                    tone_of_voice_guidance: null,
                })
            })

            expect(requests).toHaveLength(0)
        })
    })
})
