import type React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { usePostReportingV2 } from 'domains/reporting/models/queries'

import { useSkillMetricsByDay } from './useSkillMetricsByDay'

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

describe('useSkillMetricsByDay', () => {
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
                useSkillMetricsByDay({
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
            () => useSkillMetricsByDay({ ...PARAMS, enabled: false }),
            { wrapper },
        )

        expect(result.current.data).toBeUndefined()
    })

    it('merges tickets and csat maps into one point per date, sorted ascending', () => {
        const ticketsMap = new Map<string, number | null>([
            ['2026-06-01', 10],
            ['2026-06-02', 12],
            ['2026-06-04', 8],
        ])
        const csatMap = new Map<string, number | null>([
            ['2026-06-01', 4.5],
            ['2026-06-03', 4.2],
            ['2026-06-04', 4.7],
        ])
        mockUsePostReportingV2
            .mockReturnValueOnce({
                data: ticketsMap,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: csatMap,
                isFetching: false,
                isError: false,
            })

        const { result } = renderHook(() => useSkillMetricsByDay(PARAMS), {
            wrapper,
        })

        expect(result.current.data).toEqual([
            { date: '2026-06-01', tickets: 10, csat: 4.5, successRate: null },
            { date: '2026-06-02', tickets: 12, csat: null, successRate: null },
            { date: '2026-06-03', tickets: null, csat: 4.2, successRate: null },
            { date: '2026-06-04', tickets: 8, csat: 4.7, successRate: null },
        ])
    })

    it('disables the success rate query when includeSuccessRate is not set', () => {
        renderHook(() => useSkillMetricsByDay(PARAMS), { wrapper })

        const successRateCall = mockUsePostReportingV2.mock.calls.find(
            (call) => call[1]?.metricName === 'ai-agent-success-rate-by-skill',
        )

        expect(successRateCall).toBeDefined()
        expect(successRateCall?.[2]?.enabled).toBe(false)
    })

    it('merges per-day success rate values when includeSuccessRate is true', () => {
        const ticketsMap = new Map<string, number | null>([['2026-06-01', 5]])
        const csatMap = new Map<string, number | null>([['2026-06-01', 4.2]])
        const successRateMap = new Map<string, number | null>([
            ['2026-06-01', 0.85],
        ])
        mockUsePostReportingV2
            .mockReturnValueOnce({
                data: ticketsMap,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: csatMap,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: successRateMap,
                isFetching: false,
                isError: false,
            })

        const { result } = renderHook(
            () => useSkillMetricsByDay({ ...PARAMS, includeSuccessRate: true }),
            { wrapper },
        )

        expect(result.current.data).toEqual([
            { date: '2026-06-01', tickets: 5, csat: 4.2, successRate: 0.85 },
        ])
    })

    it('stores raw 0-1 success rate values in the per-day map', () => {
        renderHook(
            () => useSkillMetricsByDay({ ...PARAMS, includeSuccessRate: true }),
            { wrapper },
        )

        const successRateCall = mockUsePostReportingV2.mock.calls.find(
            (call) => call[1]?.metricName === 'ai-agent-success-rate-by-skill',
        )

        expect(successRateCall).toBeDefined()
        const selectFn = successRateCall?.[2]?.select
        const map = selectFn?.({
            data: {
                data: [
                    {
                        'eventDatetime.day': '2026-06-01T00:00:00.000Z',
                        successRate: '0.85',
                    },
                ],
            },
        })

        expect(map?.get('2026-06-01')).toBe(0.85)
    })

    it('builds the tickets map from rows via select', () => {
        renderHook(() => useSkillMetricsByDay(PARAMS), { wrapper })

        const ticketsCall = mockUsePostReportingV2.mock.calls.find((call) => {
            const builtQuery = call[1]
            return builtQuery?.metricName === 'ai-agent-ticket-volume-by-skill'
        })

        expect(ticketsCall).toBeDefined()
        const selectFn = ticketsCall?.[2]?.select
        const map = selectFn?.({
            data: {
                data: [
                    {
                        'eventDatetime.day': '2026-06-01T00:00:00.000Z',
                        aiAgentTicketVolume: '10',
                    },
                    {
                        eventDatetime: '2026-06-02T00:00:00.000Z',
                        aiAgentTicketVolume: '12',
                    },
                ],
            },
        })

        expect(map?.get('2026-06-01')).toBe(10)
        expect(map?.get('2026-06-02')).toBe(12)
    })

    it('rounds csat values to one decimal in the per-day map', () => {
        renderHook(() => useSkillMetricsByDay(PARAMS), { wrapper })

        const csatCall = mockUsePostReportingV2.mock.calls.find((call) => {
            const builtQuery = call[1]
            return builtQuery?.metricName === 'ai-agent-csat-by-skill'
        })

        expect(csatCall).toBeDefined()
        const selectFn = csatCall?.[2]?.select
        const map = selectFn?.({
            data: {
                data: [
                    {
                        'eventDatetime.day': '2026-06-01T00:00:00.000Z',
                        averageCSAT: '4.456',
                    },
                ],
            },
        })

        expect(map?.get('2026-06-01')).toBe(4.5)
    })
})
