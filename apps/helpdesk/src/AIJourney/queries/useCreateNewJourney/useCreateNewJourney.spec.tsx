import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateJourneyHandler,
    mockCreateJourneyResponse,
} from '@gorgias/convert-mocks'

import { flowsListKeys } from 'AIJourney/queries/useCustomFlows/useCustomFlows'
import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { workflowsConfigurationDefinitionKeys } from 'models/workflows/queries'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useCreateNewJourney } from './useCreateNewJourney'

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockGetBaseUrl = getGorgiasRevenueAddonApiBaseUrl as jest.Mock
const server = setupServer()
let queryClient = mockQueryClient()

const createWrapper = () => {
    return ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

const mutationData = {
    params: {
        store_integration_id: 123,
        store_name: 'shopify-store',
        type: 'cart_abandoned' as const,
    },
    journeyConfigs: {
        max_follow_up_messages: 3,
        offer_discount: true,
        max_discount_percent: 20,
        sms_sender_number: '(415)-111-111',
    },
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    mockGetBaseUrl.mockReturnValue('http://mocked-base-url')
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('useCreateNewJourney', () => {
    it('should successfully create a new journey', async () => {
        const response = mockCreateJourneyResponse({
            id: 'journey-1',
            type: 'cart_abandoned',
        })
        const createJourneyMock = mockCreateJourneyHandler(async () =>
            HttpResponse.json(response),
        )
        const waitForCreateJourneyRequest =
            createJourneyMock.waitForRequest(server)
        server.use(createJourneyMock.handler)

        const { result } = renderHook(() => useCreateNewJourney(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await expect(
                result.current.mutateAsync(mutationData),
            ).resolves.toEqual(response)
        })

        await waitForCreateJourneyRequest(async (request) => {
            expect(new URL(request.url).origin).toBe('http://mocked-base-url')
            expect(await request.json()).toEqual({
                ...mutationData.params,
                store_type: 'shopify',
                configuration: mutationData.journeyConfigs,
            })
        })
    })

    it('should invalidate queries on successful creation', async () => {
        server.use(mockCreateJourneyHandler().handler)
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

        const { result } = renderHook(() => useCreateNewJourney(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.mutateAsync(mutationData)
        })

        await waitFor(() => {
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: aiJourneyKeys.all(),
            })
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: workflowsConfigurationDefinitionKeys.all(),
            })
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: flowsListKeys.all(),
            })
        })
    })

    it('should handle errors when creating a new journey', async () => {
        server.use(
            mockCreateJourneyHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to create journey' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useCreateNewJourney(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await expect(
                result.current.mutateAsync({
                    ...mutationData,
                    params: {
                        ...mutationData.params,
                        type: 'session_abandoned',
                    },
                }),
            ).rejects.toBeDefined()
        })
    })
})
