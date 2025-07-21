import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { getJourneyDetails } from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { useJourneyConfiguration } from './useJourneyConfiguration'

jest.mock('@gorgias/convert-client', () => ({
    getJourneyDetails: jest.fn(),
}))

jest.mock('AIJourney/providers', () => ({
    useAccessToken: jest.fn(),
}))

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockGetJourneyDetails = getJourneyDetails as jest.Mock
const mockUseAccessToken = useAccessToken as jest.Mock
const mockGetGorgiasRevenueAddonApiBaseUrl =
    getGorgiasRevenueAddonApiBaseUrl as jest.Mock

describe('useJourneyConfiguration', () => {
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
        mockGetGorgiasRevenueAddonApiBaseUrl.mockReturnValue(
            'http://mocked-base-url',
        )
    })

    it('should fetch journey configuration successfully', async () => {
        const mockConfiguration = {
            max_follow_up_messages: 3,
            offer_discount: true,
            max_discount_percent: 20,
            sms_sender_number: '(415)-111-111',
        }

        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockGetJourneyDetails.mockResolvedValue({
            data: { configuration: mockConfiguration },
        })

        const { result } = renderHook(
            () => useJourneyConfiguration('journey-id', { enabled: true }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetJourneyDetails).toHaveBeenCalledTimes(1)
        expect(mockGetJourneyDetails).toHaveBeenCalledWith('journey-id', {
            baseURL: 'http://mocked-base-url',
            headers: { Authorization: 'mock-access-token' },
        })
        expect(result.current.data).toEqual(mockConfiguration)
    })

    it('should handle errors when fetching journey configuration', async () => {
        const mockError = new Error('Failed to fetch journey configuration')

        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockGetJourneyDetails.mockRejectedValue(mockError)

        const { result } = renderHook(
            () => useJourneyConfiguration('journey-id', { enabled: true }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(mockGetJourneyDetails).toHaveBeenCalledTimes(1)
        expect(result.current.error).toEqual(mockError)
    })

    it('should not fetch journey configuration if accessToken is missing', async () => {
        mockUseAccessToken.mockReturnValue(null)

        const { result } = renderHook(
            () => useJourneyConfiguration('journey-id', { enabled: true }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockGetJourneyDetails).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should not fetch journey configuration if journeyId is undefined', async () => {
        mockUseAccessToken.mockReturnValue('mock-access-token')

        const { result } = renderHook(
            () => useJourneyConfiguration(undefined, { enabled: true }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockGetJourneyDetails).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should respect the enabled option when set to false', async () => {
        mockUseAccessToken.mockReturnValue('mock-access-token')

        const { result } = renderHook(
            () => useJourneyConfiguration('journey-id', { enabled: false }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockGetJourneyDetails).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should refetch journey configuration when journeyId changes', async () => {
        const mockConfiguration1 = {
            max_follow_up_messages: 3,
            offer_discount: true,
            max_discount_percent: 20,
            sms_sender_number: '(415)-111-111',
        }
        const mockConfiguration2 = {
            max_follow_up_messages: 2,
            offer_discount: false,
            max_discount_percent: 15,
            sms_sender_number: '(415)-222-222',
        }

        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockGetJourneyDetails
            .mockResolvedValueOnce({
                data: { configuration: mockConfiguration1 },
            })
            .mockResolvedValueOnce({
                data: { configuration: mockConfiguration2 },
            })

        const { result, rerender } = renderHook(
            ({ journeyId }) => useJourneyConfiguration(journeyId),
            {
                wrapper: createWrapper(),
                initialProps: { journeyId: 'journey-1' },
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(mockConfiguration1)

        rerender({ journeyId: 'journey-2' })

        await waitFor(() =>
            expect(result.current.data).toEqual(mockConfiguration2),
        )

        expect(mockGetJourneyDetails).toHaveBeenCalledTimes(2)
        expect(mockGetJourneyDetails).toHaveBeenNthCalledWith(
            1,
            'journey-1',
            expect.any(Object),
        )
        expect(mockGetJourneyDetails).toHaveBeenNthCalledWith(
            2,
            'journey-2',
            expect.any(Object),
        )
    })

    it('should handle empty configuration data', async () => {
        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockGetJourneyDetails.mockResolvedValue({
            data: { configuration: null },
        })

        const { result } = renderHook(
            () => useJourneyConfiguration('journey-id', { enabled: true }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetJourneyDetails).toHaveBeenCalledTimes(1)
        expect(result.current.data).toBeNull()
    })
})
