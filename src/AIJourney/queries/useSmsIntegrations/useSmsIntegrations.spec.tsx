import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { getSmsIntegrations } from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { useSmsIntegrations } from './useSmsIntegrations'

jest.mock('@gorgias/convert-client', () => ({
    getSmsIntegrations: jest.fn(),
}))

jest.mock('AIJourney/providers', () => ({
    useAccessToken: jest.fn(),
}))

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockGetSmsIntegrations = getSmsIntegrations as jest.Mock
const mockUseAccessToken = useAccessToken as jest.Mock
const mockGetGorgiasRevenueAddonApiBaseUrl =
    getGorgiasRevenueAddonApiBaseUrl as jest.Mock

describe('useSmsIntegrations', () => {
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

    it('should fetch SMS integrations successfully', async () => {
        const mockIntegrations = [
            { sms_integration_id: 'sms-1', name: 'Integration 1' },
            { sms_integration_id: 'sms-2', name: 'Integration 2' },
        ]

        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockGetSmsIntegrations.mockResolvedValue({ data: mockIntegrations })

        const { result } = renderHook(() => useSmsIntegrations(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetSmsIntegrations).toHaveBeenCalledTimes(1)
        expect(mockGetSmsIntegrations).toHaveBeenCalledWith({
            baseURL: 'http://mocked-base-url',
            headers: { Authorization: 'mock-access-token' },
        })
        expect(result.current.data).toEqual(mockIntegrations)
    })

    it('should handle errors when fetching SMS integrations', async () => {
        const mockError = new Error('Failed to fetch SMS integrations')

        mockUseAccessToken.mockReturnValue('mock-access-token')
        mockGetSmsIntegrations.mockRejectedValue(mockError)

        const { result } = renderHook(() => useSmsIntegrations(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(mockGetSmsIntegrations).toHaveBeenCalledTimes(1)
        expect(result.current.error).toEqual(mockError)
    })

    it('should not fetch SMS integrations if accessToken is missing', async () => {
        mockUseAccessToken.mockReturnValue(null)

        const { result } = renderHook(() => useSmsIntegrations(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockGetSmsIntegrations).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should respect the enabled option when set to false', async () => {
        mockUseAccessToken.mockReturnValue('mock-access-token')

        const { result } = renderHook(
            () => useSmsIntegrations({ enabled: false }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockGetSmsIntegrations).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })
})
