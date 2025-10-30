import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { getAllJourneysPublic, JourneyTypeEnum } from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers/TokenProvider/TokenProvider'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { useJourneys } from './useJourneys'

jest.mock('@gorgias/convert-client', () => ({
    ...jest.requireActual('@gorgias/convert-client'),
    getAllJourneysPublic: jest.fn(),
}))

jest.mock('AIJourney/providers/TokenProvider/TokenProvider', () => ({
    useAccessToken: jest.fn(),
}))

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockGetAllJourneysPublic = getAllJourneysPublic as jest.Mock
const mockUseAccessToken = useAccessToken as jest.Mock
const mockGetGorgiasRevenueAddonApiBaseUrl =
    getGorgiasRevenueAddonApiBaseUrl as jest.Mock

describe('useJourneys', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockGetGorgiasRevenueAddonApiBaseUrl.mockReturnValue(
            'http://mocked-base-url',
        )
    })

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

    it('should fetch journeys successfully', async () => {
        const mockJourneys = [
            { id: 1, type: 'cart_abandoned', state: 'active' },
            { id: 2, type: 'welcome_email', state: 'draft' },
        ]

        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockGetAllJourneysPublic.mockResolvedValue({ data: mockJourneys })

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

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetAllJourneysPublic).toHaveBeenCalledTimes(1)
        expect(mockGetAllJourneysPublic).toHaveBeenCalledWith(
            {
                integration_id: 123,
                types: [
                    JourneyTypeEnum.CartAbandoned,
                    JourneyTypeEnum.SessionAbandoned,
                ],
            },
            {
                baseURL: 'http://mocked-base-url',
                headers: { Authorization: 'mock-access-token' },
            },
        )
        expect(result.current.data).toEqual(mockJourneys)
    })

    it('should handle errors when fetching journeys', async () => {
        const mockError = new Error('Failed to fetch journeys')

        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockGetAllJourneysPublic.mockRejectedValue(mockError)

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

        expect(mockGetAllJourneysPublic).toHaveBeenCalledTimes(1)
        expect(result.current.error).toEqual(mockError)
    })

    it('should not fetch journeys if accessToken is missing', async () => {
        mockUseAccessToken.mockReturnValue(null)

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

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockGetAllJourneysPublic).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should not fetch journeys if integrationId is undefined', async () => {
        mockUseAccessToken.mockReturnValue('mock-access-token')

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

        expect(mockGetAllJourneysPublic).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should respect the enabled option when set to false', async () => {
        mockUseAccessToken.mockReturnValue('mock-access-token')

        const { result } = renderHook(
            () =>
                useJourneys(
                    123,
                    [
                        JourneyTypeEnum.CartAbandoned,
                        JourneyTypeEnum.SessionAbandoned,
                    ],
                    { enabled: false },
                ),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockGetAllJourneysPublic).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should refetch journeys when integrationId changes', async () => {
        const mockJourneys1 = [
            { id: 1, type: 'cart_abandoned', state: 'active' },
        ]
        const mockJourneys2 = [{ id: 2, type: 'welcome_email', state: 'draft' }]

        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockGetAllJourneysPublic
            .mockResolvedValueOnce({ data: mockJourneys1 })
            .mockResolvedValueOnce({ data: mockJourneys2 })

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

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(mockJourneys1)

        rerender({ integrationId: 456 })

        await waitFor(() => expect(result.current.data).toEqual(mockJourneys2))

        expect(mockGetAllJourneysPublic).toHaveBeenCalledTimes(2)
        expect(mockGetAllJourneysPublic).toHaveBeenNthCalledWith(
            1,
            {
                integration_id: 123,
                types: [
                    JourneyTypeEnum.CartAbandoned,
                    JourneyTypeEnum.SessionAbandoned,
                ],
            },
            expect.any(Object),
        )
        expect(mockGetAllJourneysPublic).toHaveBeenNthCalledWith(
            2,
            {
                integration_id: 456,
                types: [
                    JourneyTypeEnum.CartAbandoned,
                    JourneyTypeEnum.SessionAbandoned,
                ],
            },
            expect.any(Object),
        )
    })

    it('should accept custom types parameter', async () => {
        const mockJourneys = [
            { id: 1, type: 'cart_abandoned', state: 'active' },
        ]

        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockGetAllJourneysPublic.mockResolvedValue({ data: mockJourneys })

        const customTypes = [JourneyTypeEnum.CartAbandoned]
        const { result } = renderHook(() => useJourneys(123, customTypes, {}), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetAllJourneysPublic).toHaveBeenCalledWith(
            {
                integration_id: 123,
                types: customTypes,
            },
            {
                baseURL: 'http://mocked-base-url',
                headers: { Authorization: 'mock-access-token' },
            },
        )
        expect(result.current.data).toEqual(mockJourneys)
    })
})
