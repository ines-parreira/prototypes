/**
 * Per-skill success rate metric.
 *
 * M2 ships the new performance side-panel layout that surfaces a Success rate
 * card with a small sparkline. The real cube/measure isn't available yet
 * (planned for M4 — see COACH-2779), so this hook returns deterministic mock
 * data shaped exactly like the future query response: a current value, a
 * prior-period value for trend computation, and a per-day series for the
 * sparkline.
 *
 * Values are ratios in 0–1 range to match the codebase's `decimal-to-percent`
 * formatter convention. Swap the internals for a real `usePostReportingV2`
 * call once the cube is live; the call sites consume the same
 * `SkillSuccessRateMetricData` shape.
 */

import moment from 'moment'

import type { DateRange } from 'pages/aiAgent/components/KnowledgeEditor/shared/types'

export type SkillSuccessRateSparklinePoint = {
    date: string
    value: number
}

export type SkillSuccessRateMetricData = {
    /** Current-period success rate as a 0–1 ratio. */
    value: number | null
    /** Previous-period success rate for trend comparison, 0–1 ratio. */
    prevValue: number | null
    /**
     * Per-day success rate ratios for the current period. Drives the small
     * line chart inside the Success rate card. Ordered oldest → newest.
     */
    sparklineData: SkillSuccessRateSparklinePoint[]
    isLoading: boolean
}

type UseSkillSuccessRateMetricParams = {
    skillId: number | undefined
    dateRange?: DateRange
    enabled?: boolean
}

const MOCK_SPARKLINE_VALUES = [
    0.78, 0.8, 0.79, 0.82, 0.81, 0.84, 0.83, 0.82, 0.85, 0.86, 0.84, 0.83, 0.85,
    0.86, 0.88, 0.87, 0.86, 0.88, 0.89, 0.87, 0.86, 0.85, 0.86, 0.88, 0.87,
    0.89, 0.9, 0.85,
] as const

const buildMockSparkline = (
    dateRange: DateRange | undefined,
): SkillSuccessRateSparklinePoint[] => {
    if (!dateRange) {
        return MOCK_SPARKLINE_VALUES.map((value, index) => ({
            date: String(index + 1),
            value,
        }))
    }

    const start = moment.utc(dateRange.start_datetime).startOf('day')
    const end = moment.utc(dateRange.end_datetime).startOf('day')
    if (!start.isValid() || !end.isValid() || end.isBefore(start)) return []

    const days = Math.max(1, end.diff(start, 'days') + 1)

    return Array.from({ length: days }, (_, index) => {
        const isoDate = start.clone().add(index, 'days').format('YYYY-MM-DD')
        const value =
            MOCK_SPARKLINE_VALUES[index % MOCK_SPARKLINE_VALUES.length]

        return { date: isoDate, value }
    })
}

export const useSkillSuccessRateMetric = ({
    skillId,
    dateRange,
    enabled = true,
}: UseSkillSuccessRateMetricParams): SkillSuccessRateMetricData => {
    const isAvailable = enabled && !!skillId

    if (!isAvailable) {
        return {
            value: null,
            prevValue: null,
            sparklineData: [],
            isLoading: false,
        }
    }

    return {
        value: 0.85,
        prevValue: 0.83,
        sparklineData: buildMockSparkline(dateRange),
        isLoading: false,
    }
}
