import { assumeMock, renderHook } from '@repo/testing'
import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { useUpdateDashboardCache } from 'domains/reporting/hooks/dashboards/useUpdateDashboardCache'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'

jest.mock('@gorgias/helpdesk-queries')

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
            queryKeys.analyticsCustomReports.getAnalyticsCustomReport(id),
        )
    })

    it('sets the dashboard in the cache if no cached data', () => {
        const { result } = renderHook(() => useUpdateDashboardCache(id))

        result.current(dashboard)

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
            queryKeys.analyticsCustomReports.getAnalyticsCustomReport(id),
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
            queryKeys.analyticsCustomReports.getAnalyticsCustomReport(id),
            expect.objectContaining({
                ...cachedData,
                data: expect.objectContaining(dashboard),
            }),
        )
    })
})
