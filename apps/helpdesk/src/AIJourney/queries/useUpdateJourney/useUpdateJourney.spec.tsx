import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { JourneyStatusEnum, patchJourney } from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { useUpdateJourney } from './useUpdateJourney'

jest.mock('@gorgias/convert-client', () => ({
    patchJourney: jest.fn(),
}))

jest.mock('AIJourney/providers', () => ({
    useAccessToken: jest.fn(),
}))

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockPatchJourney = patchJourney as jest.Mock
const mockUseAccessToken = useAccessToken as jest.Mock
const mockGetGorgiasRevenueAddonApiBaseUrl =
    getGorgiasRevenueAddonApiBaseUrl as jest.Mock

describe('useUpdateJourney', () => {
    let queryClient: QueryClient

    const createWrapper = () => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
                mutations: {
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
        mockGetGorgiasRevenueAddonApiBaseUrl.mockReturnValue(
            'http://mocked-base-url',
        )
    })

    it('should update journey successfully', async () => {
        const mockUpdatedJourney = {
            id: 'journey-123',
            state: 'draft',
            type: 'cart_abandoned',
        }

        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockPatchJourney.mockResolvedValue({ data: mockUpdatedJourney })

        const { result } = renderHook(() => useUpdateJourney(), {
            wrapper: createWrapper(),
        })

        const mutationData = {
            journeyId: 'journey-123',
            params: {
                state: 'draft' as JourneyStatusEnum,
            },
            journeyConfigs: {
                max_follow_up_messages: 3,
                offer_discount: true,
                max_discount_percent: 20,
                sms_sender_number: '(415)-111-111',
            },
        }

        await result.current.mutateAsync(mutationData)

        expect(mockPatchJourney).toHaveBeenCalledTimes(1)
        expect(mockPatchJourney).toHaveBeenCalledWith(
            'journey-123',
            {
                configuration: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    sms_sender_number: '(415)-111-111',
                },
                state: 'draft',
            },
            {
                baseURL: 'http://mocked-base-url',
                headers: { Authorization: 'mock-access-token' },
            },
        )
    })

    it('should handle errors when updating journey', async () => {
        const mockError = new Error('Failed to update journey')

        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockPatchJourney.mockRejectedValue(mockError)

        const { result } = renderHook(() => useUpdateJourney(), {
            wrapper: createWrapper(),
        })

        const mutationData = {
            journeyId: 'journey-123',
            params: {
                state: 'draft' as JourneyStatusEnum,
            },
            journeyConfigs: {
                max_follow_up_messages: 3,
                offer_discount: true,
                max_discount_percent: 20,
                sms_sender_number: '(415)-111-111',
            },
        }

        await expect(result.current.mutateAsync(mutationData)).rejects.toThrow(
            'Failed to update journey',
        )

        // Wait for the mutation to enter error state
        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        expect(mockPatchJourney).toHaveBeenCalledTimes(1)
        expect(result.current.error).toEqual(mockError)
    })

    it('should update journey with minimal parameters', async () => {
        const mockUpdatedJourney = {
            id: 'journey-123',
            state: 'active',
            type: 'cart_abandoned',
        }

        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockPatchJourney.mockResolvedValue({ data: mockUpdatedJourney })

        const { result } = renderHook(() => useUpdateJourney(), {
            wrapper: createWrapper(),
        })

        const mutationData = {
            journeyId: 'journey-123',
            params: {
                state: 'active' as JourneyStatusEnum,
            },
            journeyConfigs: {
                max_follow_up_messages: 1,
                offer_discount: false,
            },
        }

        await result.current.mutateAsync(mutationData)

        expect(mockPatchJourney).toHaveBeenCalledTimes(1)
        expect(mockPatchJourney).toHaveBeenCalledWith(
            'journey-123',
            {
                configuration: {
                    max_follow_up_messages: 1,
                    offer_discount: false,
                },
                state: 'active',
            },
            {
                baseURL: 'http://mocked-base-url',
                headers: { Authorization: 'mock-access-token' },
            },
        )
    })

    it('should handle update with null access token', async () => {
        mockUseAccessToken.mockReturnValue(null)

        mockPatchJourney.mockRejectedValue(
            new Error('Unauthorized: Access token is required'),
        )

        const { result } = renderHook(() => useUpdateJourney(), {
            wrapper: createWrapper(),
        })

        const mutationData = {
            journeyId: 'journey-123',
            params: {
                state: 'draft' as JourneyStatusEnum,
            },
            journeyConfigs: {
                max_follow_up_messages: 3,
                offer_discount: true,
                max_discount_percent: 20,
                sms_sender_number: '(415)-111-111',
            },
        }

        await expect(result.current.mutateAsync(mutationData)).rejects.toThrow(
            'Unauthorized: Access token is required',
        )

        expect(mockPatchJourney).not.toHaveBeenCalled()
    })

    it('should track mutation state correctly', async () => {
        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockPatchJourney.mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(() => resolve({ data: {} }), 100),
                ),
        )

        const { result } = renderHook(() => useUpdateJourney(), {
            wrapper: createWrapper(),
        })

        expect(result.current.isIdle).toBe(true)

        const mutationPromise = result.current.mutateAsync({
            journeyId: 'journey-123',
            params: { state: 'draft' },
            journeyConfigs: { max_follow_up_messages: 3 },
        })

        await waitFor(() => {})

        await mutationPromise

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })
    })

    it('should update journey configuration with discount settings', async () => {
        const mockUpdatedJourney = {
            id: 'journey-123',
            state: 'draft',
            type: 'cart_abandoned',
        }

        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockPatchJourney.mockResolvedValue({ data: mockUpdatedJourney })

        const { result } = renderHook(() => useUpdateJourney(), {
            wrapper: createWrapper(),
        })

        const mutationData = {
            journeyId: 'journey-123',
            params: {
                state: 'draft' as JourneyStatusEnum,
            },
            journeyConfigs: {
                max_follow_up_messages: 2,
                offer_discount: true,
                max_discount_percent: 15,
                sms_sender_number: '(415)-222-222',
            },
        }

        await result.current.mutateAsync(mutationData)

        expect(mockPatchJourney).toHaveBeenCalledWith(
            'journey-123',
            {
                configuration: {
                    max_follow_up_messages: 2,
                    offer_discount: true,
                    max_discount_percent: 15,
                    sms_sender_number: '(415)-222-222',
                },
                state: 'draft',
            },
            {
                baseURL: 'http://mocked-base-url',
                headers: { Authorization: 'mock-access-token' },
            },
        )
    })

    it('should handle network errors gracefully', async () => {
        const networkError = new Error('Network error')
        networkError.name = 'NetworkError'

        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockPatchJourney.mockRejectedValue(networkError)

        const { result } = renderHook(() => useUpdateJourney(), {
            wrapper: createWrapper(),
        })

        const mutationData = {
            journeyId: 'journey-123',
            params: {
                state: 'draft' as JourneyStatusEnum,
            },
            journeyConfigs: {
                max_follow_up_messages: 3,
                offer_discount: false,
            },
        }

        await expect(result.current.mutateAsync(mutationData)).rejects.toThrow(
            'Network error',
        )

        // Wait for the mutation to enter error state
        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        expect(result.current.error).toEqual(networkError)
    })
})
