import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { getAllJourneysPublic } from '@gorgias/convert-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { flowsListKeys, useFlowsList } from './useCustomFlows'

jest.mock('@gorgias/convert-client', () => ({
    ...jest.requireActual('@gorgias/convert-client'),
    getAllJourneysPublic: jest.fn(),
}))

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockGetAllJourneysPublic = getAllJourneysPublic as jest.Mock
const mockGetBaseUrl = getGorgiasRevenueAddonApiBaseUrl as jest.Mock

describe('useCustomFlows', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockGetBaseUrl.mockReturnValue('http://mocked-base-url')
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

    describe('flowsListKeys', () => {
        it('should return base key for all', () => {
            expect(flowsListKeys.all()).toEqual(['flowsList'])
        })

        it('should return list key with integrationId', () => {
            expect(flowsListKeys.list(42)).toEqual(['flowsList', 42])
        })

        it('should return list key with undefined integrationId', () => {
            expect(flowsListKeys.list(undefined)).toEqual([
                'flowsList',
                undefined,
            ])
        })
    })

    describe('useFlowsList', () => {
        it('should partition flat array response by type', async () => {
            const journeys = [
                { id: 'j1', type: 'cart_abandoned' },
                { id: 'j2', type: 'session_abandoned' },
                { id: 'c1', type: 'custom', name: 'My Flow' },
            ]

            mockGetAllJourneysPublic.mockResolvedValue({ data: journeys })

            const { result } = renderHook(() => useFlowsList(123), {
                wrapper: createWrapper(),
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toEqual({
                built_in: [
                    { id: 'j1', type: 'cart_abandoned' },
                    { id: 'j2', type: 'session_abandoned' },
                ],
                custom: [{ id: 'c1', type: 'custom', name: 'My Flow' }],
            })
            expect(mockGetAllJourneysPublic).toHaveBeenCalledWith(
                { integration_id: 123 },
                { baseURL: 'http://mocked-base-url' },
            )
        })

        it('should return empty arrays when response data is null', async () => {
            mockGetAllJourneysPublic.mockResolvedValue({ data: null })

            const { result } = renderHook(() => useFlowsList(123), {
                wrapper: createWrapper(),
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toEqual({
                built_in: [],
                custom: [],
            })
        })

        it('should not fetch when integrationId is undefined', async () => {
            const { result } = renderHook(() => useFlowsList(undefined), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.fetchStatus).toBe('idle')
            })

            expect(mockGetAllJourneysPublic).not.toHaveBeenCalled()
        })

        it('should not fetch when enabled option is false', async () => {
            const { result } = renderHook(
                () => useFlowsList(123, { enabled: false }),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.fetchStatus).toBe('idle')
            })

            expect(mockGetAllJourneysPublic).not.toHaveBeenCalled()
        })
    })
})
