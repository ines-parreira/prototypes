import type React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { usePostReportingV2 } from 'domains/reporting/models/queries'

import { useSkillMetrics } from './useSkillMetrics'

jest.mock('domains/reporting/models/queries')

const mockUsePostReportingV2 = usePostReportingV2 as jest.Mock

const PARAMS = {
    shopIntegrationId: 2954,
    resourceSourceId: 44202,
    resourceSourceSetId: 1585,
    dateRange: {
        start_datetime: '2026-06-01T00:00:00.000Z',
        end_datetime: '2026-06-08T00:00:00.000Z',
    },
}

describe('useSkillMetrics', () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })

    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        queryClient.clear()
        jest.clearAllMocks()
        mockUsePostReportingV2.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })
    })

    it('disables queries when shopIntegrationId is falsy', () => {
        const { result } = renderHook(
            () =>
                useSkillMetrics({
                    shopIntegrationId: 0,
                    resourceSourceId: 44202,
                    resourceSourceSetId: 1585,
                }),
            { wrapper },
        )

        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
    })

    it('disables queries when resourceSourceId is falsy', () => {
        const { result } = renderHook(
            () =>
                useSkillMetrics({
                    shopIntegrationId: 2954,
                    resourceSourceId: 0,
                    resourceSourceSetId: 1585,
                }),
            { wrapper },
        )

        expect(result.current.data).toBeUndefined()
    })

    it('disables queries when resourceSourceSetId is falsy', () => {
        const { result } = renderHook(
            () =>
                useSkillMetrics({
                    shopIntegrationId: 2954,
                    resourceSourceId: 44202,
                    resourceSourceSetId: 0,
                }),
            { wrapper },
        )

        expect(result.current.data).toBeUndefined()
    })

    it('disables queries when enabled is false', () => {
        const { result } = renderHook(
            () =>
                useSkillMetrics({
                    shopIntegrationId: 2954,
                    resourceSourceId: 44202,
                    resourceSourceSetId: 1585,
                    enabled: false,
                }),
            { wrapper },
        )

        expect(result.current.data).toBeUndefined()
    })

    it('returns isLoading=false when query is disabled even if mock signals fetching', () => {
        mockUsePostReportingV2.mockReturnValue({
            data: undefined,
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(
            () =>
                useSkillMetrics({
                    shopIntegrationId: 0,
                    resourceSourceId: 44202,
                    resourceSourceSetId: 1585,
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('merges current and previous-period results into a single record', () => {
        mockUsePostReportingV2
            .mockReturnValueOnce({
                data: 100,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: 80,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: 12,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: 9,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: 4.5,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: 4.2,
                isFetching: false,
                isError: false,
            })

        const { result } = renderHook(() => useSkillMetrics(PARAMS), {
            wrapper,
        })

        expect(result.current.data).toEqual({
            tickets: 100,
            prevTickets: 80,
            handoverTickets: 12,
            prevHandoverTickets: 9,
            csat: 4.5,
            prevCsat: 4.2,
        })
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('returns isLoading=true while any underlying query is fetching', () => {
        mockUsePostReportingV2
            .mockReturnValueOnce({
                data: undefined,
                isFetching: true,
                isError: false,
            })
            .mockReturnValue({
                data: undefined,
                isFetching: false,
                isError: false,
            })

        const { result } = renderHook(() => useSkillMetrics(PARAMS), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('returns isError=true when any underlying query errors', () => {
        mockUsePostReportingV2.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })
        mockUsePostReportingV2.mockReturnValueOnce({
            data: undefined,
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(() => useSkillMetrics(PARAMS), {
            wrapper,
        })

        expect(result.current.isError).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('rounds CSAT values to one decimal via select transform', () => {
        renderHook(() => useSkillMetrics(PARAMS), { wrapper })

        const csatCallArgs = mockUsePostReportingV2.mock.calls.find((call) => {
            const builtQuery = call[1]
            return builtQuery?.metricName === 'ai-agent-csat-by-skill'
        })

        expect(csatCallArgs).toBeDefined()
        const selectFn = csatCallArgs?.[2]?.select
        expect(selectFn?.({ data: { data: [{ averageCSAT: '4.456' }] } })).toBe(
            4.5,
        )
        expect(selectFn?.({ data: { data: [{ averageCSAT: null }] } })).toBe(
            null,
        )
        expect(selectFn?.({ data: { data: [] } })).toBe(null)
    })
})
