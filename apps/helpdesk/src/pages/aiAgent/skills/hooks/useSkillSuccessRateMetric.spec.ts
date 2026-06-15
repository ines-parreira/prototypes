import { renderHook } from '@repo/testing'

import { usePostReportingV2 } from 'domains/reporting/models/queries'

import { useSkillSuccessRateMetric } from './useSkillSuccessRateMetric'

jest.mock('domains/reporting/models/queries')

const mockUsePostReportingV2 = usePostReportingV2 as jest.Mock

const PARAMS = {
    skillId: 44202,
    resourceSourceSetId: 1585,
    shopIntegrationId: 2954,
    dateRange: {
        start_datetime: '2026-06-01T00:00:00Z',
        end_datetime: '2026-06-08T00:00:00Z',
    },
}

describe('useSkillSuccessRateMetric', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUsePostReportingV2.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })
    })

    it('returns empty data when skillId is undefined', () => {
        const { result } = renderHook(() =>
            useSkillSuccessRateMetric({
                skillId: undefined,
                resourceSourceSetId: 1585,
                shopIntegrationId: 2954,
                dateRange: {
                    start_datetime: '2026-06-01T00:00:00Z',
                    end_datetime: '2026-06-08T00:00:00Z',
                },
            }),
        )

        expect(result.current).toEqual({
            value: null,
            prevValue: null,
            sparklineData: [],
            isLoading: false,
        })
    })

    it('returns empty data when resourceSourceSetId is missing', () => {
        const { result } = renderHook(() =>
            useSkillSuccessRateMetric({
                skillId: 44202,
                resourceSourceSetId: undefined,
                shopIntegrationId: 2954,
                dateRange: {
                    start_datetime: '2026-06-01T00:00:00Z',
                    end_datetime: '2026-06-08T00:00:00Z',
                },
            }),
        )

        expect(result.current.value).toBeNull()
        expect(result.current.prevValue).toBeNull()
        expect(result.current.sparklineData).toEqual([])
    })

    it('returns empty data when shopIntegrationId is missing', () => {
        const { result } = renderHook(() =>
            useSkillSuccessRateMetric({
                skillId: 44202,
                resourceSourceSetId: 1585,
                shopIntegrationId: undefined,
                dateRange: {
                    start_datetime: '2026-06-01T00:00:00Z',
                    end_datetime: '2026-06-08T00:00:00Z',
                },
            }),
        )

        expect(result.current.value).toBeNull()
        expect(result.current.prevValue).toBeNull()
        expect(result.current.sparklineData).toEqual([])
    })

    it('returns empty data when enabled is false', () => {
        const { result } = renderHook(() =>
            useSkillSuccessRateMetric({
                skillId: 44202,
                resourceSourceSetId: 1585,
                shopIntegrationId: 2954,
                enabled: false,
                dateRange: {
                    start_datetime: '2026-06-01T00:00:00Z',
                    end_datetime: '2026-06-08T00:00:00Z',
                },
            }),
        )

        expect(result.current.value).toBeNull()
        expect(result.current.prevValue).toBeNull()
        expect(result.current.sparklineData).toEqual([])
    })

    it('exposes current/previous values and the sparkline series', () => {
        mockUsePostReportingV2
            .mockReturnValueOnce({
                data: 0.86,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: 0.81,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: [
                    { date: '2026-06-01', value: 0.82 },
                    { date: '2026-06-02', value: 0.85 },
                ],
                isFetching: false,
                isError: false,
            })

        const { result } = renderHook(() => useSkillSuccessRateMetric(PARAMS))

        expect(result.current.value).toBe(0.86)
        expect(result.current.prevValue).toBe(0.81)
        expect(result.current.sparklineData).toEqual([
            { date: '2026-06-01', value: 0.82 },
            { date: '2026-06-02', value: 0.85 },
        ])
        expect(result.current.isLoading).toBe(false)
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

        const { result } = renderHook(() => useSkillSuccessRateMetric(PARAMS))

        expect(result.current.isLoading).toBe(true)
    })

    it('parses the success-rate value from the cube row via select', () => {
        renderHook(() => useSkillSuccessRateMetric(PARAMS))

        const summaryCall = mockUsePostReportingV2.mock.calls.find((call) => {
            const builtQuery = call[1]
            return (
                builtQuery?.metricName === 'ai-agent-success-rate-by-skill' &&
                !builtQuery?.time_dimensions?.[0]?.granularity
            )
        })

        expect(summaryCall).toBeDefined()
        const selectFn = summaryCall?.[2]?.select
        expect(selectFn?.({ data: { data: [{ successRate: '0.873' }] } })).toBe(
            0.873,
        )
        expect(selectFn?.({ data: { data: [] } })).toBeNull()
        expect(
            selectFn?.({ data: { data: [{ successRate: null }] } }),
        ).toBeNull()
    })

    it('builds sparkline points from per-day rows via select', () => {
        renderHook(() => useSkillSuccessRateMetric(PARAMS))

        const sparklineCall = mockUsePostReportingV2.mock.calls.find((call) => {
            const builtQuery = call[1]
            return (
                builtQuery?.metricName === 'ai-agent-success-rate-by-skill' &&
                builtQuery?.time_dimensions?.[0]?.granularity === 'day'
            )
        })

        expect(sparklineCall).toBeDefined()
        const selectFn = sparklineCall?.[2]?.select
        const result = selectFn?.({
            data: {
                data: [
                    {
                        'eventDatetime.day': '2026-06-01T00:00:00.000Z',
                        successRate: '0.82',
                    },
                    {
                        eventDatetime: '2026-06-02T00:00:00.000Z',
                        successRate: '0.85',
                    },
                    {
                        'eventDatetime.day': '2026-06-03T00:00:00.000Z',
                        successRate: null,
                    },
                ],
            },
        })
        expect(result).toEqual([
            { date: '2026-06-01', value: 0.82 },
            { date: '2026-06-02', value: 0.85 },
        ])
    })
})
