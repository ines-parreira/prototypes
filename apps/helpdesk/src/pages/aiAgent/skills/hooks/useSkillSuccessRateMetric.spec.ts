import { renderHook } from '@repo/testing'

import { useSkillSuccessRateMetric } from './useSkillSuccessRateMetric'

describe('useSkillSuccessRateMetric', () => {
    it('returns empty data when skillId is undefined', () => {
        const { result } = renderHook(() =>
            useSkillSuccessRateMetric({ skillId: undefined }),
        )

        expect(result.current).toEqual({
            value: null,
            prevValue: null,
            sparklineData: [],
            isLoading: false,
        })
    })

    it('returns empty data when enabled is false even with a skillId', () => {
        const { result } = renderHook(() =>
            useSkillSuccessRateMetric({ skillId: 1, enabled: false }),
        )

        expect(result.current.value).toBeNull()
        expect(result.current.prevValue).toBeNull()
        expect(result.current.sparklineData).toEqual([])
    })

    describe('when enabled with a skillId', () => {
        it('returns the deterministic current and previous values', () => {
            const { result } = renderHook(() =>
                useSkillSuccessRateMetric({ skillId: 1 }),
            )

            expect(result.current.value).toBe(0.85)
            expect(result.current.prevValue).toBe(0.83)
            expect(result.current.isLoading).toBe(false)
        })

        it('returns a fallback sparkline indexed 1..28 when no dateRange is provided', () => {
            const { result } = renderHook(() =>
                useSkillSuccessRateMetric({ skillId: 1 }),
            )

            expect(result.current.sparklineData).toHaveLength(28)
            expect(result.current.sparklineData[0]).toEqual({
                date: '1',
                value: 0.78,
            })
            expect(result.current.sparklineData[27]).toEqual({
                date: '28',
                value: 0.85,
            })
            result.current.sparklineData.forEach((point) => {
                expect(point.value).toBeGreaterThanOrEqual(0)
                expect(point.value).toBeLessThanOrEqual(1)
            })
        })

        it('returns one ISO-dated point per day in the dateRange, oldest to newest', () => {
            const { result } = renderHook(() =>
                useSkillSuccessRateMetric({
                    skillId: 1,
                    dateRange: {
                        start_datetime: '2026-01-01T00:00:00.000Z',
                        end_datetime: '2026-01-05T00:00:00.000Z',
                    },
                }),
            )

            expect(result.current.sparklineData).toHaveLength(5)
            expect(result.current.sparklineData.map((p) => p.date)).toEqual([
                '2026-01-01',
                '2026-01-02',
                '2026-01-03',
                '2026-01-04',
                '2026-01-05',
            ])
        })

        it('returns a single point when start and end are the same day', () => {
            const { result } = renderHook(() =>
                useSkillSuccessRateMetric({
                    skillId: 1,
                    dateRange: {
                        start_datetime: '2026-01-01T00:00:00.000Z',
                        end_datetime: '2026-01-01T00:00:00.000Z',
                    },
                }),
            )

            expect(result.current.sparklineData).toEqual([
                { date: '2026-01-01', value: 0.78 },
            ])
        })

        it('cycles through the mock values when the range exceeds the mock length', () => {
            const { result } = renderHook(() =>
                useSkillSuccessRateMetric({
                    skillId: 1,
                    dateRange: {
                        start_datetime: '2026-01-01T00:00:00.000Z',
                        end_datetime: '2026-02-15T00:00:00.000Z',
                    },
                }),
            )

            expect(result.current.sparklineData).toHaveLength(46)
            expect(result.current.sparklineData[0].value).toBe(
                result.current.sparklineData[28].value,
            )
        })

        it('returns an empty sparkline when the dateRange has invalid dates', () => {
            const { result } = renderHook(() =>
                useSkillSuccessRateMetric({
                    skillId: 1,
                    dateRange: {
                        start_datetime: 'not-a-date',
                        end_datetime: '2026-01-05T00:00:00.000Z',
                    },
                }),
            )

            expect(result.current.sparklineData).toEqual([])
        })

        it('returns an empty sparkline when end is before start', () => {
            const { result } = renderHook(() =>
                useSkillSuccessRateMetric({
                    skillId: 1,
                    dateRange: {
                        start_datetime: '2026-01-10T00:00:00.000Z',
                        end_datetime: '2026-01-05T00:00:00.000Z',
                    },
                }),
            )

            expect(result.current.sparklineData).toEqual([])
        })
    })
})
