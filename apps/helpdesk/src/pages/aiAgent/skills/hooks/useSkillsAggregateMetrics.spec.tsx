import type React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { usePostReportingV2 } from 'domains/reporting/models/queries'

import {
    skillKey,
    useSkillsAggregateMetrics,
} from './useSkillsAggregateMetrics'

jest.mock('domains/reporting/models/queries')

const mockUsePostReportingV2 = usePostReportingV2 as jest.Mock

const PARAMS = {
    shopIntegrationId: 2954,
    dateRange: {
        start_datetime: '2026-06-01T00:00:00.000Z',
        end_datetime: '2026-06-08T00:00:00.000Z',
    },
}

const ROW = (
    sourceSet: string,
    source: string,
    measureKey: string,
    value: number | string,
) => ({
    resourceSourceSetId: sourceSet,
    resourceSourceId: source,
    [measureKey]: value,
})

describe('useSkillsAggregateMetrics', () => {
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
                useSkillsAggregateMetrics({
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
                useSkillsAggregateMetrics({
                    ...PARAMS,
                    enabled: false,
                }),
            { wrapper },
        )

        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
    })

    it('merges the three per-skill queries into a Map keyed by skillKey', () => {
        const ticketsMap = new Map<string, number>([
            [skillKey('100', '42'), 5],
            [skillKey('100', '57'), 12],
        ])
        const handoverMap = new Map<string, number>([
            [skillKey('100', '42'), 1],
        ])
        const csatMap = new Map<string, number>([[skillKey('100', '57'), 4.5]])

        mockUsePostReportingV2
            .mockReturnValueOnce({
                data: ticketsMap,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: handoverMap,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: csatMap,
                isFetching: false,
                isError: false,
            })

        const { result } = renderHook(() => useSkillsAggregateMetrics(PARAMS), {
            wrapper,
        })

        expect(result.current.data?.get(skillKey('100', '42'))).toEqual({
            tickets: 5,
            handoverTickets: 1,
            csat: null,
        })
        expect(result.current.data?.get(skillKey('100', '57'))).toEqual({
            tickets: 12,
            handoverTickets: null,
            csat: 4.5,
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

        const { result } = renderHook(() => useSkillsAggregateMetrics(PARAMS), {
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

        const { result } = renderHook(() => useSkillsAggregateMetrics(PARAMS), {
            wrapper,
        })

        expect(result.current.isError).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('rounds CSAT values to one decimal in the parseByKey transform', () => {
        renderHook(() => useSkillsAggregateMetrics(PARAMS), { wrapper })

        const csatCallArgs = mockUsePostReportingV2.mock.calls.find((call) => {
            const builtQuery = call[1]
            return builtQuery?.metricName === 'ai-agent-csat-per-skill'
        })

        expect(csatCallArgs).toBeDefined()
        const selectFn = csatCallArgs?.[2]?.select as (response: {
            data: { data: unknown[] }
        }) => Map<string, number>

        const out = selectFn({
            data: {
                data: [
                    ROW('100', '42', 'averageCSAT', '4.456'),
                    ROW('100', '57', 'averageCSAT', null as unknown as number),
                ],
            },
        })
        expect(out.get(skillKey('100', '42'))).toBe(4.5)
        expect(out.has(skillKey('100', '57'))).toBe(false)
    })

    it('parseByKey skips rows missing the skill identity or with a non-finite measure', () => {
        renderHook(() => useSkillsAggregateMetrics(PARAMS), { wrapper })

        const ticketsCallArgs = mockUsePostReportingV2.mock.calls.find(
            (call) => {
                const builtQuery = call[1]
                return (
                    builtQuery?.metricName ===
                    'ai-agent-ticket-volume-per-skill'
                )
            },
        )

        const selectFn = ticketsCallArgs?.[2]?.select as (response: {
            data: { data: unknown[] }
        }) => Map<string, number>

        const out = selectFn({
            data: {
                data: [
                    ROW('100', '42', 'aiAgentTicketVolume', 7),
                    { resourceSourceId: '57', aiAgentTicketVolume: 9 },
                    { resourceSourceSetId: '100', aiAgentTicketVolume: 3 },
                    ROW('100', '99', 'aiAgentTicketVolume', 'not-a-number'),
                ],
            },
        })

        expect(out.size).toBe(1)
        expect(out.get(skillKey('100', '42'))).toBe(7)
    })
})
