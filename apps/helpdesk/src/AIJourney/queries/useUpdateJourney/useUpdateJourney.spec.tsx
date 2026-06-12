import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockPatchJourneyHandler,
    mockPatchJourneyResponse,
} from '@gorgias/convert-mocks'

import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useUpdateJourney } from './useUpdateJourney'

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

describe('useUpdateJourney', () => {
    it('should call patchJourney with params and configuration', async () => {
        const response = mockPatchJourneyResponse({ id: 'journey-123' })
        const patchJourneyMock = mockPatchJourneyHandler(async () =>
            HttpResponse.json(response),
        )
        const waitForPatchJourneyRequest =
            patchJourneyMock.waitForRequest(server)
        server.use(patchJourneyMock.handler)

        const mutationData = {
            journeyId: 'journey-123',
            params: { state: 'active' as const },
            journeyConfigs: {
                max_follow_up_messages: 2,
                offer_discount: true,
                max_discount_percent: 15,
                sms_sender_number: '(415)-222-222',
            },
        }

        const { result } = renderHook(() => useUpdateJourney(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.mutateAsync(mutationData)
        })

        await waitForPatchJourneyRequest(async (request) => {
            const url = new URL(request.url)

            expect(url.origin).toBe('http://mocked-base-url')
            expect(url.pathname).toContain('journey-123')
            expect(await request.json()).toEqual({
                state: 'active',
                configuration: mutationData.journeyConfigs,
            })
        })
    })

    it('should invalidate journey configuration on success', async () => {
        server.use(mockPatchJourneyHandler().handler)
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

        const { result } = renderHook(() => useUpdateJourney(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.mutateAsync({
                journeyId: 'journey-123',
                params: { state: 'paused' },
            })
        })

        await waitFor(() =>
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: aiJourneyKeys.journeyConfiguration('journey-123'),
            }),
        )
    })

    it('should surface errors when update fails', async () => {
        server.use(
            mockPatchJourneyHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to update journey' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useUpdateJourney(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            result.current.mutate({
                journeyId: 'journey-123',
                params: { state: 'active' },
            })
        })

        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.error).toBeDefined()
    })
})
