import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetSmsIntegrationsHandler,
    mockGetSmsIntegrationsResponse,
    mockSMSIntegrationApiDTO,
} from '@gorgias/convert-mocks'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useSmsIntegrations } from './useSmsIntegrations'

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

describe('useSmsIntegrations', () => {
    it('should fetch SMS integrations', async () => {
        const response = mockGetSmsIntegrationsResponse([
            mockSMSIntegrationApiDTO({
                sms_integration_id: 1,
                store_integration_id: 123,
                phone_number: '+15550001',
            }),
        ])
        const getSmsIntegrationsMock = mockGetSmsIntegrationsHandler(async () =>
            HttpResponse.json(response),
        )
        const waitForGetSmsIntegrationsRequest =
            getSmsIntegrationsMock.waitForRequest(server)
        server.use(getSmsIntegrationsMock.handler)

        const { result } = renderHook(() => useSmsIntegrations(), {
            wrapper: createWrapper(),
        })

        await waitForGetSmsIntegrationsRequest((request) => {
            expect(new URL(request.url).origin).toBe('http://mocked-base-url')
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(response)
    })

    it('should not fetch when disabled', async () => {
        const requests: Request[] = []
        server.use(
            mockGetSmsIntegrationsHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(mockGetSmsIntegrationsResponse())
            }).handler,
        )

        const { result } = renderHook(
            () => useSmsIntegrations({ enabled: false }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))

        expect(requests).toHaveLength(0)
        expect(result.current.data).toBeUndefined()
    })

    it('should handle errors when fetching SMS integrations', async () => {
        server.use(
            mockGetSmsIntegrationsHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to fetch SMS integrations' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useSmsIntegrations(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.error).toBeDefined()
    })
})
