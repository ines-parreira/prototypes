import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { testJourney } from '@gorgias/convert-client'

import { useTestSms } from './useTestSms'

jest.mock('@gorgias/convert-client', () => ({
    testJourney: jest.fn(),
}))

const mockTestJourney = testJourney as jest.Mock

describe('useTestSms', () => {
    let queryClient: QueryClient

    const createWrapper = () => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })

        return ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should send test SMS successfully', async () => {
        const mockResponse = { success: true }
        mockTestJourney.mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useTestSms(), {
            wrapper: createWrapper(),
        })

        await result.current.mutateAsync({
            journeyId: 'journey-123',
            phoneNumber: '+1415111111',
            products: [
                {
                    product_id: 'product-123',
                    variant_id: 'variant-123',
                    price: 50.0,
                },
            ],
        })

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(mockTestJourney).toHaveBeenCalledTimes(1)
        expect(mockTestJourney).toHaveBeenCalledWith(
            'journey-123',
            {
                phone_number: '+1415111111',
                products: [
                    {
                        product_id: 'product-123',
                        variant_id: 'variant-123',
                        price: 50.0,
                    },
                ],
                returning_customer: undefined,
            },
            {
                baseURL: expect.any(String),
            },
        )
    })

    it('should handle errors when sending test SMS', async () => {
        const mockError = new Error('Failed to send test SMS')
        mockTestJourney.mockRejectedValue(mockError)

        const { result } = renderHook(() => useTestSms(), {
            wrapper: createWrapper(),
        })

        await expect(
            result.current.mutateAsync({
                journeyId: 'journey-123',
                phoneNumber: '+1415111111',
                products: [
                    {
                        product_id: 'product-123',
                        variant_id: 'variant-123',
                        price: 50.0,
                    },
                ],
            }),
        ).rejects.toThrow('Failed to send test SMS')

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        expect(mockTestJourney).toHaveBeenCalledTimes(1)
    })

    it('should send test SMS with returningCustomer parameter', async () => {
        const mockResponse = { success: true }
        mockTestJourney.mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useTestSms(), {
            wrapper: createWrapper(),
        })

        await result.current.mutateAsync({
            journeyId: 'journey-123',
            phoneNumber: '+1415111111',
            products: [],
            returningCustomer: true,
        })

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(mockTestJourney).toHaveBeenCalledWith(
            'journey-123',
            {
                phone_number: '+1415111111',
                products: [],
                returning_customer: true,
            },
            {
                baseURL: expect.any(String),
            },
        )
    })
})
