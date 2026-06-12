import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { JourneyTypeEnum } from '@gorgias/convert-client'
import {
    mockGetAllJourneysPublicHandler,
    mockJourneyApiDTO,
} from '@gorgias/convert-mocks'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { flowsListKeys, useFlowsList } from './useCustomFlows'

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockGetBaseUrl = getGorgiasRevenueAddonApiBaseUrl as jest.Mock
const server = setupServer()
let queryClient = mockQueryClient()

const createWrapper = () => {
    queryClient = mockQueryClient()

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

const cartJourney = mockJourneyApiDTO({
    id: 'j1',
    type: JourneyTypeEnum.CartAbandoned,
})
const sessionJourney = mockJourneyApiDTO({
    id: 'j2',
    type: JourneyTypeEnum.SessionAbandoned,
})
const customJourney = mockJourneyApiDTO({
    id: 'c1',
    type: JourneyTypeEnum.Custom,
    name: 'My Flow',
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

describe('useCustomFlows', () => {
    describe('flowsListKeys', () => {
        it('should return base and list keys', () => {
            expect(flowsListKeys.all()).toEqual(['flowsList'])
            expect(flowsListKeys.list(42)).toEqual(['flowsList', 42])
            expect(flowsListKeys.list(undefined)).toEqual([
                'flowsList',
                undefined,
            ])
        })
    })

    describe('useFlowsList', () => {
        it('should partition flat array response by type', async () => {
            const getJourneysMock = mockGetAllJourneysPublicHandler(async () =>
                HttpResponse.json([cartJourney, sessionJourney, customJourney]),
            )
            const waitForGetJourneysRequest =
                getJourneysMock.waitForRequest(server)
            server.use(getJourneysMock.handler)

            const { result } = renderHook(() => useFlowsList(123), {
                wrapper: createWrapper(),
            })

            await waitForGetJourneysRequest((request) => {
                const url = new URL(request.url)

                expect(url.origin).toBe('http://mocked-base-url')
                expect(url.searchParams.get('integration_id')).toBe('123')
            })
            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toEqual({
                built_in: [cartJourney, sessionJourney],
                custom: [customJourney],
            })
        })

        it('should partition the new built_in/custom response shape', async () => {
            server.use(
                mockGetAllJourneysPublicHandler(async () =>
                    HttpResponse.json({
                        built_in: [cartJourney],
                        custom: { items: [customJourney] },
                    } as never),
                ).handler,
            )

            const { result } = renderHook(() => useFlowsList(123), {
                wrapper: createWrapper(),
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toEqual({
                built_in: [cartJourney],
                custom: [customJourney],
            })
        })

        it('should return empty arrays when response data is null', async () => {
            server.use(
                mockGetAllJourneysPublicHandler(async () =>
                    HttpResponse.json(null),
                ).handler,
            )

            const { result } = renderHook(() => useFlowsList(123), {
                wrapper: createWrapper(),
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toEqual({ built_in: [], custom: [] })
        })

        it('should be idle when integrationId is undefined or disabled', async () => {
            const requests: Request[] = []
            server.use(
                mockGetAllJourneysPublicHandler(async ({ request }) => {
                    requests.push(request)

                    return HttpResponse.json([])
                }).handler,
            )

            const { result, rerender } = renderHook(
                ({ integrationId, enabled }) =>
                    useFlowsList(integrationId, { enabled }),
                {
                    wrapper: createWrapper(),
                    initialProps: {
                        integrationId: undefined as number | undefined,
                        enabled: true,
                    },
                },
            )

            await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))

            rerender({ integrationId: 123, enabled: false })

            await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))
            expect(requests).toHaveLength(0)
        })

        it('should handle errors from the client', async () => {
            server.use(
                mockGetAllJourneysPublicHandler(async () =>
                    HttpResponse.json(
                        { error: 'Failed to fetch flows' } as never,
                        { status: 500 },
                    ),
                ).handler,
            )

            const { result } = renderHook(() => useFlowsList(123), {
                wrapper: createWrapper(),
            })

            await waitFor(() => expect(result.current.isError).toBe(true))

            expect(result.current.error).toBeDefined()
        })
    })
})
