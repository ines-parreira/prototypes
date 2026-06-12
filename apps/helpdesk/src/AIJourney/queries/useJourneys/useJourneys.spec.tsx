import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { JourneyTypeEnum } from '@gorgias/convert-client'
import {
    mockGetAllJourneysPublicHandler,
    mockGetAllJourneysPublicResponse,
    mockJourneyApiDTO,
} from '@gorgias/convert-mocks'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useJourneys } from './useJourneys'

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

const cartJourney = mockJourneyApiDTO({
    id: 'cart',
    type: JourneyTypeEnum.CartAbandoned,
})
const sessionJourney = mockJourneyApiDTO({
    id: 'session',
    type: JourneyTypeEnum.SessionAbandoned,
})
const welcomeJourney = mockJourneyApiDTO({
    id: 'welcome',
    type: JourneyTypeEnum.Welcome,
})

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

describe('useJourneys', () => {
    it('should fetch journeys successfully', async () => {
        const response = mockGetAllJourneysPublicResponse([
            cartJourney,
            sessionJourney,
        ])
        const getJourneysMock = mockGetAllJourneysPublicHandler(async () =>
            HttpResponse.json(response),
        )
        const waitForGetJourneysRequest = getJourneysMock.waitForRequest(server)
        server.use(getJourneysMock.handler)

        const { result } = renderHook(
            () =>
                useJourneys(123, [
                    JourneyTypeEnum.CartAbandoned,
                    JourneyTypeEnum.SessionAbandoned,
                ]),
            {
                wrapper: createWrapper(),
            },
        )

        await waitForGetJourneysRequest((request) => {
            const url = new URL(request.url)

            expect(url.origin).toBe('http://mocked-base-url')
            expect(url.searchParams.get('integration_id')).toBe('123')
            expect(url.searchParams.getAll('types')).toEqual([
                JourneyTypeEnum.CartAbandoned,
                JourneyTypeEnum.SessionAbandoned,
            ])
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(response)
    })

    it('should flatten the new journey list response shape', async () => {
        server.use(
            mockGetAllJourneysPublicHandler(async () =>
                HttpResponse.json({
                    built_in: [cartJourney],
                    custom: { items: [welcomeJourney] },
                } as never),
            ).handler,
        )

        const { result } = renderHook(
            () => useJourneys(123, [JourneyTypeEnum.CartAbandoned]),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual([cartJourney, welcomeJourney])
    })

    it('should handle errors when fetching journeys', async () => {
        server.use(
            mockGetAllJourneysPublicHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to fetch journeys' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(
            () =>
                useJourneys(123, [
                    JourneyTypeEnum.CartAbandoned,
                    JourneyTypeEnum.SessionAbandoned,
                ]),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toBeDefined()
    })

    it('should not fetch journeys if integrationId is undefined', async () => {
        const requests: Request[] = []
        server.use(
            mockGetAllJourneysPublicHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json([])
            }).handler,
        )

        const { result } = renderHook(
            () =>
                useJourneys(undefined, [
                    JourneyTypeEnum.CartAbandoned,
                    JourneyTypeEnum.SessionAbandoned,
                ]),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(requests).toHaveLength(0)
        expect(result.current.data).toBeUndefined()
    })

    it('should respect the enabled option when set to false', async () => {
        const requests: Request[] = []
        server.use(
            mockGetAllJourneysPublicHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json([])
            }).handler,
        )

        const { result } = renderHook(
            () =>
                useJourneys(123, [JourneyTypeEnum.CartAbandoned], {
                    enabled: false,
                }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(requests).toHaveLength(0)
        expect(result.current.data).toBeUndefined()
    })

    it('should refetch journeys when integrationId changes', async () => {
        server.use(
            mockGetAllJourneysPublicHandler(async ({ request }) => {
                const integrationId = new URL(request.url).searchParams.get(
                    'integration_id',
                )

                return HttpResponse.json(
                    integrationId === '123' ? [cartJourney] : [welcomeJourney],
                )
            }).handler,
        )

        const { result, rerender } = renderHook(
            ({ integrationId }) =>
                useJourneys(integrationId, [
                    JourneyTypeEnum.CartAbandoned,
                    JourneyTypeEnum.SessionAbandoned,
                ]),
            {
                wrapper: createWrapper(),
                initialProps: { integrationId: 123 },
            },
        )

        await waitFor(() => expect(result.current.data).toEqual([cartJourney]))

        rerender({ integrationId: 456 })

        await waitFor(() =>
            expect(result.current.data).toEqual([welcomeJourney]),
        )
    })
})
