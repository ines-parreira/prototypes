import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockTestJourneyApiDTO,
    mockTestJourneyHandler,
    mockTestProductApiDTO,
} from '@gorgias/convert-mocks'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useTestSms } from './useTestSms'

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

const product = mockTestProductApiDTO({ product_id: 'gid://shopify/Product/1' })

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

describe('useTestSms', () => {
    it('should send a test journey SMS', async () => {
        const response = mockTestJourneyApiDTO({ status: 'sent' } as never)
        const testJourneyMock = mockTestJourneyHandler(async () =>
            HttpResponse.json(response as never),
        )
        const waitForTestJourneyRequest = testJourneyMock.waitForRequest(server)
        server.use(testJourneyMock.handler)

        const { result } = renderHook(() => useTestSms(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await expect(
                result.current.mutateAsync({
                    journeyId: 'journey-123',
                    phoneNumber: '+15550001',
                    products: [product],
                    returningCustomer: true,
                    testVariantId: 'variant-1',
                }),
            ).resolves.toEqual(response)
        })

        await waitForTestJourneyRequest(async (request) => {
            const url = new URL(request.url)

            expect(url.origin).toBe('http://mocked-base-url')
            expect(url.pathname).toContain('journey-123')
            expect(await request.json()).toEqual({
                phone_number: '+15550001',
                products: [product],
                returning_customer: true,
                test_variant_id: 'variant-1',
            })
        })
    })

    it('should omit optional fields when they are not provided', async () => {
        const testJourneyMock = mockTestJourneyHandler(async () =>
            HttpResponse.json(mockTestJourneyApiDTO() as never),
        )
        const waitForTestJourneyRequest = testJourneyMock.waitForRequest(server)
        server.use(testJourneyMock.handler)

        const { result } = renderHook(() => useTestSms(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.mutateAsync({
                journeyId: 'journey-123',
                phoneNumber: '+15550001',
                products: [product],
            })
        })

        await waitForTestJourneyRequest(async (request) => {
            expect(await request.json()).toEqual({
                phone_number: '+15550001',
                products: [product],
                returning_customer: undefined,
            })
        })
    })

    it('should surface errors when sending test SMS fails', async () => {
        server.use(
            mockTestJourneyHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to send test SMS' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useTestSms(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            result.current.mutate({
                journeyId: 'journey-123',
                phoneNumber: '+15550001',
                products: [product],
            })
        })

        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.error).toBeDefined()
    })
})
