import type React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { usePostReportingV2 } from 'domains/reporting/models/queries'

import { skillKey, useSkillsSuccessRates } from './useSkillsSuccessRates'

jest.mock('domains/reporting/models/queries')

const mockUsePostReportingV2 = usePostReportingV2 as jest.Mock

const PARAMS = {
    shopIntegrationId: 2954,
    dateRange: {
        start_datetime: '2026-06-01T00:00:00.000Z',
        end_datetime: '2026-06-08T00:00:00.000Z',
    },
}

describe('useSkillsSuccessRates', () => {
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
                useSkillsSuccessRates({
                    ...PARAMS,
                    shopIntegrationId: 0,
                }),
            { wrapper },
        )

        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
    })

    it('disables queries when enabled is false', () => {
        const { result } = renderHook(
            () =>
                useSkillsSuccessRates({
                    ...PARAMS,
                    enabled: false,
                }),
            { wrapper },
        )

        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
    })

    it('merges current and previous period maps into one entry per skill', () => {
        const currentMap = new Map<string, number>([
            [skillKey('100', '42'), 0.85],
            [skillKey('100', '57'), 0.6],
        ])
        const prevMap = new Map<string, number>([
            [skillKey('100', '42'), 0.8],
            [skillKey('100', '99'), 0.5],
        ])

        mockUsePostReportingV2
            .mockReturnValueOnce({
                data: currentMap,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: prevMap,
                isFetching: false,
                isError: false,
            })

        const { result } = renderHook(() => useSkillsSuccessRates(PARAMS), {
            wrapper,
        })

        expect(result.current.data?.get(skillKey('100', '42'))).toEqual({
            value: 0.85,
            prevValue: 0.8,
        })
        expect(result.current.data?.get(skillKey('100', '57'))).toEqual({
            value: 0.6,
            prevValue: null,
        })
        expect(result.current.data?.get(skillKey('100', '99'))).toEqual({
            value: null,
            prevValue: 0.5,
        })
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('returns isLoading=true while either underlying query is fetching', () => {
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

        const { result } = renderHook(() => useSkillsSuccessRates(PARAMS), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('returns isError=true when either underlying query errors', () => {
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

        const { result } = renderHook(() => useSkillsSuccessRates(PARAMS), {
            wrapper,
        })

        expect(result.current.isError).toBe(true)
    })

    it('parseRatesByKey skips rows missing the skill identity or with a non-finite rate', () => {
        renderHook(() => useSkillsSuccessRates(PARAMS), { wrapper })

        // The first call is the current-period query — its `select` is the
        // function we exercise here.
        const currentCallArgs = mockUsePostReportingV2.mock.calls[0]
        const selectFn = currentCallArgs?.[2]?.select as (response: {
            data: { data: unknown[] }
        }) => Map<string, number>

        const out = selectFn({
            data: {
                data: [
                    {
                        resourceSourceSetId: '100',
                        resourceSourceId: '42',
                        successRate: '0.86',
                    },
                    { resourceSourceId: '57', successRate: 0.7 },
                    { resourceSourceSetId: '100', successRate: 0.4 },
                    {
                        resourceSourceSetId: '100',
                        resourceSourceId: '99',
                        successRate: 'not-a-number',
                    },
                    {
                        resourceSourceSetId: '100',
                        resourceSourceId: '11',
                        successRate: null,
                    },
                ],
            },
        })

        expect(out.size).toBe(1)
        expect(out.get(skillKey('100', '42'))).toBe(0.86)
    })

    it('issues the current-period and previous-period queries with shifted Period filters', () => {
        renderHook(() => useSkillsSuccessRates(PARAMS), { wrapper })

        expect(mockUsePostReportingV2).toHaveBeenCalledTimes(2)
        const currentQuery = mockUsePostReportingV2.mock.calls[0][1]
        const prevQuery = mockUsePostReportingV2.mock.calls[1][1]

        expect(currentQuery?.metricName).toBe('ai-agent-success-rate-per-skill')
        expect(prevQuery?.metricName).toBe('ai-agent-success-rate-per-skill')

        // Same metric, but the prev query targets a different period window.
        expect(currentQuery).not.toEqual(prevQuery)
    })
})
