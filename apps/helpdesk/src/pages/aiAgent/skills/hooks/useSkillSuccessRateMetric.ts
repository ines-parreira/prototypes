/**
 * Per-skill success rate metric.
 *
 * Fires three single-measure queries against the `SuccessRate.successRate`
 * cube, filtered through the `TicketInsightsSkillParticipation` helper by the
 * skill identity (resourceSourceSetId, resourceSourceId):
 *   1) current-period value
 *   2) prior-period value (same window, shifted backward by its length)
 *   3) per-day series for the sparkline (granularity: 'day')
 *
 * Each metric goes in its own Cube.js query — combining measures from
 * multiple Family B cubes through the helper makes Cube.js intersect to
 * tickets present in all cubes, which silently drops handover tickets via
 * CSAT's HAVING clause.
 */

import { useMemo } from 'react'

import { usePostReportingV2 } from 'domains/reporting/models/queries'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { aiAgentSuccessRateBySkillQueryFactory } from 'domains/reporting/models/scopes/aiAgentSuccessRate'
import type { ApiStatsFilters } from 'domains/reporting/models/stat/types'
import {
    APIOnlyFilterKey,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    getPreviousPeriod,
    readCubeDateBucket,
    readCubeNumber,
} from 'domains/reporting/utils/reporting'
import { useAppSelector } from 'hooks/useAppSelector'
import type { DateRange } from 'pages/aiAgent/components/KnowledgeEditor/shared/types'
import { getTimezone } from 'state/currentUser/selectors'

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
    /** Help center ID — the resourceSourceSetId half of the skill identity. */
    resourceSourceSetId: number | undefined
    /**
     * Shop integration ID. Required so the query is scoped to a single store —
     * on multi-store accounts an unset value would blend metrics across stores.
     */
    shopIntegrationId: number | undefined
    dateRange?: DateRange
    enabled?: boolean
}

type SuccessRateRow = Record<string, unknown>

const buildFilters = (
    resourceSourceId: number,
    resourceSourceSetId: number,
    shopIntegrationId: number,
    period: { start_datetime: string; end_datetime: string },
): ApiStatsFilters => ({
    [FilterKey.Period]: period,
    [FilterKey.Stores]: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [shopIntegrationId],
    },
    [APIOnlyFilterKey.ResourceSourceId]: withLogicalOperator([
        String(resourceSourceId),
    ]),
    [APIOnlyFilterKey.ResourceSourceSetId]: withLogicalOperator([
        String(resourceSourceSetId),
    ]),
})

export const useSkillSuccessRateMetric = ({
    skillId,
    resourceSourceSetId,
    shopIntegrationId,
    dateRange,
    enabled = true,
}: UseSkillSuccessRateMetricParams): SkillSuccessRateMetricData => {
    const timezone = useAppSelector(getTimezone) ?? 'UTC'

    const isAvailable =
        enabled &&
        !!skillId &&
        !!resourceSourceSetId &&
        !!shopIntegrationId &&
        !!dateRange

    const period = useMemo(
        () =>
            dateRange
                ? {
                      start_datetime: dateRange.start_datetime,
                      end_datetime: dateRange.end_datetime,
                  }
                : undefined,
        [dateRange],
    )

    const prevPeriod = useMemo(
        () => (period ? getPreviousPeriod(period) : undefined),
        [period],
    )

    const currentFilters = useMemo(
        () =>
            isAvailable && period
                ? buildFilters(
                      skillId,
                      resourceSourceSetId,
                      shopIntegrationId,
                      period,
                  )
                : undefined,
        [isAvailable, skillId, resourceSourceSetId, shopIntegrationId, period],
    )

    const prevFilters = useMemo(
        () =>
            isAvailable && prevPeriod
                ? buildFilters(
                      skillId,
                      resourceSourceSetId,
                      shopIntegrationId,
                      prevPeriod,
                  )
                : undefined,
        [
            isAvailable,
            skillId,
            resourceSourceSetId,
            shopIntegrationId,
            prevPeriod,
        ],
    )

    const currentQuery = useMemo(
        () =>
            currentFilters
                ? aiAgentSuccessRateBySkillQueryFactory({
                      timezone,
                      filters: currentFilters,
                  })
                : undefined,
        [timezone, currentFilters],
    )

    const sparklineQuery = useMemo(
        () =>
            currentFilters
                ? aiAgentSuccessRateBySkillQueryFactory({
                      timezone,
                      filters: currentFilters,
                      granularity: ReportingGranularity.Day,
                  })
                : undefined,
        [timezone, currentFilters],
    )

    const prevQuery = useMemo(
        () =>
            prevFilters
                ? aiAgentSuccessRateBySkillQueryFactory({
                      timezone,
                      filters: prevFilters,
                  })
                : undefined,
        [timezone, prevFilters],
    )

    const { data: currentValue, isFetching: isCurrentFetching } =
        usePostReportingV2<SuccessRateRow[], number | null>(
            undefined,
            currentQuery,
            {
                enabled: isAvailable,
                select: (response) =>
                    readCubeNumber(
                        (response.data.data as SuccessRateRow[])[0],
                        'successRate',
                    ),
            },
        )

    const { data: prevValue, isFetching: isPrevFetching } = usePostReportingV2<
        SuccessRateRow[],
        number | null
    >(undefined, prevQuery, {
        enabled: isAvailable,
        select: (response) =>
            readCubeNumber(
                (response.data.data as SuccessRateRow[])[0],
                'successRate',
            ),
    })

    const { data: sparklineData, isFetching: isSparklineFetching } =
        usePostReportingV2<SuccessRateRow[], SkillSuccessRateSparklinePoint[]>(
            undefined,
            sparklineQuery,
            {
                enabled: isAvailable,
                select: (response) =>
                    (response.data.data as SuccessRateRow[])
                        .map((row) => {
                            const date = readCubeDateBucket(row)
                            const value = readCubeNumber(row, 'successRate')
                            if (!date || value == null) return null
                            return { date, value }
                        })
                        .filter(
                            (point): point is SkillSuccessRateSparklinePoint =>
                                !!point,
                        ),
            },
        )

    if (!isAvailable) {
        return {
            value: null,
            prevValue: null,
            sparklineData: [],
            isLoading: false,
        }
    }

    return {
        value: currentValue ?? null,
        prevValue: prevValue ?? null,
        sparklineData: sparklineData ?? [],
        isLoading: isCurrentFetching || isPrevFetching || isSparklineFetching,
    }
}
