import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetJourneyDetailsHandler,
    mockGetJourneyDetailsResponse,
} from '@gorgias/convert-mocks'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { getJourneyData, useJourneyData } from './useJourneyData'

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockGetBaseUrl = getGorgiasRevenueAddonApiBaseUrl as jest.Mock
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

describe('getJourneyData', () => {
    it('should throw when journeyId is empty', async () => {
        await expect(getJourneyData('')).rejects.toThrow(
            'Journey ID is required',
        )
    })

    it('should fetch journey details with the configured base URL', async () => {
        const response = mockGetJourneyDetailsResponse({ id: 'journey-123' })
        const getJourneyDetailsMock = mockGetJourneyDetailsHandler(async () =>
            HttpResponse.json(response),
        )
        const waitForGetJourneyDetailsRequest =
            getJourneyDetailsMock.waitForRequest(server)
        server.use(getJourneyDetailsMock.handler)

        await expect(getJourneyData('journey-123')).resolves.toEqual(response)

        await waitForGetJourneyDetailsRequest((request) => {
            const url = new URL(request.url)

            expect(url.origin).toBe('http://mocked-base-url')
            expect(url.pathname).toContain('journey-123')
        })
    })
})

describe('useJourneyData', () => {
    it('should fetch journey data successfully', async () => {
        const response = mockGetJourneyDetailsResponse({ id: 'journey-123' })
        server.use(
            mockGetJourneyDetailsHandler(async () =>
                HttpResponse.json(response),
            ).handler,
        )

        const { result } = renderHook(() => useJourneyData('journey-123'), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(response)
    })

    it('should not fetch when journeyId is undefined or disabled', async () => {
        const requests: Request[] = []
        server.use(
            mockGetJourneyDetailsHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(mockGetJourneyDetailsResponse())
            }).handler,
        )

        const { result, rerender } = renderHook(
            ({ journeyId, enabled }) => useJourneyData(journeyId, { enabled }),
            {
                wrapper: createWrapper(),
                initialProps: {
                    journeyId: undefined as string | undefined,
                    enabled: true,
                },
            },
        )

        await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))

        rerender({ journeyId: 'journey-123', enabled: false })

        await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))
        expect(requests).toHaveLength(0)
    })

    it('should handle errors when fetching journey data', async () => {
        server.use(
            mockGetJourneyDetailsHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to fetch journey details' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useJourneyData('journey-123'), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.error).toBeDefined()
    })

    it('should refetch when journeyId changes', async () => {
        const firstResponse = mockGetJourneyDetailsResponse({ id: 'journey-1' })
        const secondResponse = mockGetJourneyDetailsResponse({
            id: 'journey-2',
        })

        server.use(
            mockGetJourneyDetailsHandler(async ({ request }) => {
                const id = new URL(request.url).pathname.includes('journey-1')
                    ? 'journey-1'
                    : 'journey-2'

                return HttpResponse.json(
                    id === 'journey-1' ? firstResponse : secondResponse,
                )
            }).handler,
        )

        const { result, rerender } = renderHook(
            ({ journeyId }) => useJourneyData(journeyId),
            {
                wrapper: createWrapper(),
                initialProps: { journeyId: 'journey-1' },
            },
        )

        await waitFor(() => expect(result.current.data).toEqual(firstResponse))

        rerender({ journeyId: 'journey-2' })

        await waitFor(() => expect(result.current.data).toEqual(secondResponse))
    })
})
