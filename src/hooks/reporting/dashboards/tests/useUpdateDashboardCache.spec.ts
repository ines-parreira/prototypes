import { QueryClient, useQueryClient } from '@tanstack/react-query'

import { getGetAnalyticsCustomReportQueryOptions } from '@gorgias/api-queries'

import { useUpdateDashboardCache } from 'hooks/reporting/dashboards/useUpdateDashboardCache'
import { DashboardSchema } from 'pages/stats/dashboards/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('@gorgias/api-queries')
const getGetAnalyticsCustomReportQueryOptionsMock = assumeMock(
    getGetAnalyticsCustomReportQueryOptions,
)

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

describe('useUpdateQueryCache(dashboardId)', () => {
    const mockGetQueryData = jest.fn()
    const mockSetQueryData = jest.fn()

    const mockQueryClient = {
        getQueryData: mockGetQueryData,
        setQueryData: mockSetQueryData,
    } as unknown as QueryClient

    const id = 123
    const dashboard = { name: 'Text Report', emoji: '🦫' } as DashboardSchema

    beforeEach(() => {
        getGetAnalyticsCustomReportQueryOptionsMock.mockImplementation(
            (id: number) => ({ queryKey: ['dashboard', id] }),
        )

        useQueryClientMock.mockImplementation(() => mockQueryClient)
    })

    it('returns a function', () => {
        const { result } = renderHook(() => useUpdateDashboardCache(id))

        expect(result.current).toBeInstanceOf(Function)
    })

    it('reads the dashboard from the cache', () => {
        const { result } = renderHook(() => useUpdateDashboardCache(id))

        result.current(dashboard)

        expect(mockQueryClient.getQueryData).toHaveBeenCalledWith(
            getGetAnalyticsCustomReportQueryOptionsMock(id).queryKey,
        )
    })

    it('sets the dashboard in the cache if no cached data', () => {
        const { result } = renderHook(() => useUpdateDashboardCache(id))

        result.current(dashboard)

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
            getGetAnalyticsCustomReportQueryOptionsMock(id).queryKey,
            expect.objectContaining({
                data: expect.objectContaining(dashboard),
            }),
        )
    })

    it('updates the dashboard in the cache if cached data', () => {
        const cachedData = { cached: true }
        mockGetQueryData.mockReturnValue(cachedData)

        const { result } = renderHook(() => useUpdateDashboardCache(id))

        result.current(dashboard)

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
            getGetAnalyticsCustomReportQueryOptionsMock(id).queryKey,
            expect.objectContaining({
                ...cachedData,
                data: expect.objectContaining(dashboard),
            }),
        )
    })
})
