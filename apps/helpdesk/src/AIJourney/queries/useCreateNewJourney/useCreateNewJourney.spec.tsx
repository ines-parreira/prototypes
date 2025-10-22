import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'

import { createJourney } from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers'

import { useCreateNewJourney } from './useCreateNewJourney'

jest.mock('@gorgias/convert-client', () => ({
    createJourney: jest.fn(),
}))

jest.mock('AIJourney/providers', () => ({
    useAccessToken: jest.fn(),
}))

const mockCreateJourney = createJourney as jest.Mock
const mockUseAccessToken = useAccessToken as jest.Mock

describe('useCreateNewJourney', () => {
    const queryClient = new QueryClient()

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAccessToken.mockReturnValue('mock-access-token')
    })

    it('should successfully create a new journey', async () => {
        const mockResponse = { id: 1, type: 'cart_abandoned' }
        mockCreateJourney.mockResolvedValue({ data: mockResponse }) // Mock the response with a .data property

        mockUseAccessToken.mockReturnValue('mock-access-token') // Ensure accessToken is mocked

        const { result } = renderHook(() => useCreateNewJourney(), { wrapper })

        await act(async () => {
            const response = await result.current.mutateAsync({
                params: {
                    store_integration_id: 123,
                    store_name: 'shopify-store',
                    type: 'cart_abandoned',
                },
                journeyConfigs: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    sms_sender_number: '(415)-111-111',
                },
            })

            expect(response).toEqual(mockResponse)
            expect(mockCreateJourney).toHaveBeenCalledTimes(1)
            expect(mockCreateJourney).toHaveBeenCalledWith(
                {
                    store_integration_id: 123,
                    store_name: 'shopify-store',
                    type: 'cart_abandoned',
                    store_type: 'shopify',
                    configuration: {
                        max_follow_up_messages: 3,
                        offer_discount: true,
                        max_discount_percent: 20,
                        sms_sender_number: '(415)-111-111',
                    },
                },
                {
                    baseURL: expect.any(String),
                    headers: { Authorization: 'mock-access-token' },
                },
            )
        })
    })

    it('should handle errors when creating a new journey', async () => {
        const mockError = new Error('Failed to create journey')
        mockCreateJourney.mockRejectedValue(mockError)

        const { result } = renderHook(() => useCreateNewJourney(), { wrapper })

        await act(async () => {
            await expect(
                result.current.mutateAsync({
                    params: {
                        store_integration_id: 123,
                        store_name: 'shopify-store',
                        type: 'session_abandoned',
                    },
                    journeyConfigs: {
                        max_follow_up_messages: 3,
                        offer_discount: true,
                        max_discount_percent: 20,
                        sms_sender_number: '(415)-111-111',
                    },
                }),
            ).rejects.toThrow('Failed to create journey')

            expect(mockCreateJourney).toHaveBeenCalledTimes(1)
            expect(mockCreateJourney).toHaveBeenCalledWith(
                {
                    store_integration_id: 123,
                    store_name: 'shopify-store',
                    type: 'session_abandoned',
                    store_type: 'shopify',
                    configuration: {
                        max_follow_up_messages: 3,
                        offer_discount: true,
                        max_discount_percent: 20,
                        sms_sender_number: '(415)-111-111',
                    },
                },
                {
                    baseURL: expect.any(String),
                    headers: { Authorization: 'mock-access-token' },
                },
            )
        })
    })

    it('should not call createJourney if accessToken is missing', async () => {
        mockUseAccessToken.mockReturnValue(null)

        const { result } = renderHook(() => useCreateNewJourney(), { wrapper })

        await act(async () => {
            await expect(
                result.current.mutateAsync({
                    params: {
                        store_integration_id: 123,
                        store_name: 'shopify-store',
                        type: 'cart_abandoned',
                    },
                    journeyConfigs: {
                        max_follow_up_messages: 3,
                        offer_discount: true,
                        max_discount_percent: 20,
                        sms_sender_number: '(415)-111-111',
                    },
                }),
            ).rejects.toThrow()

            expect(mockCreateJourney).not.toHaveBeenCalled()
        })
    })
})
