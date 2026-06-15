/**
 * Per-day metrics for a single skill — drives the Skills page trend chart
 * and per-day timeseries view. Family B per-skill cubes joined through the
 * `TicketInsightsSkillParticipation` helper.
 *
 * Each metric is its own query at granularity='day'.
 */

import { useMemo } from 'react'

import { usePostReportingV2 } from 'domains/reporting/models/queries'
import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { averageAiAgentCsatBySkillQueryFactory } from 'domains/reporting/models/scopes/aiAgentCsat'
import { aiAgentTicketVolumeBySkillQueryFactory } from 'domains/reporting/models/scopes/aiAgentSuccessRate'
import type { ApiStatsFilters } from 'domains/reporting/models/stat/types'
import {
    APIOnlyFilterKey,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    readCubeDateBucket,
    readCubeNumber,
    roundToOneDecimal,
} from 'domains/reporting/utils/reporting'
import { useAppSelector } from 'hooks/useAppSelector'
import { getTimezone } from 'state/currentUser/selectors'

type DateRange = {
    start_datetime: string
    end_datetime: string
}

export type SkillMetricsByDayPoint = {
    date: string
    tickets: number | null
    csat: number | null
}

type Row = Record<string, unknown>

const buildSkillFilters = (
    shopIntegrationId: number,
    resourceSourceId: number,
    resourceSourceSetId: number,
    period: DateRange,
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

type UseSkillMetricsByDayParams = {
    shopIntegrationId: number
    resourceSourceId: number
    resourceSourceSetId: number
    enabled?: boolean
    dateRange?: DateRange
}

type UseSkillMetricsByDayResult = {
    data: SkillMetricsByDayPoint[] | undefined
    isLoading: boolean
    isError: boolean
}

export const useSkillMetricsByDay = ({
    shopIntegrationId,
    resourceSourceId,
    resourceSourceSetId,
    enabled = true,
    dateRange,
}: UseSkillMetricsByDayParams): UseSkillMetricsByDayResult => {
    const timezone = useAppSelector(getTimezone) ?? 'UTC'

    const defaultDateRange = useMemo(() => getLast28DaysDateRange(), [])
    const period = dateRange ?? defaultDateRange

    const isAvailable =
        enabled &&
        !!shopIntegrationId &&
        !!resourceSourceId &&
        !!resourceSourceSetId

    const filters = useMemo(
        () =>
            buildSkillFilters(
                shopIntegrationId,
                resourceSourceId,
                resourceSourceSetId,
                period,
            ),
        [shopIntegrationId, resourceSourceId, resourceSourceSetId, period],
    )

    const ticketsQuery = useMemo(
        () =>
            aiAgentTicketVolumeBySkillQueryFactory({
                timezone,
                filters,
                granularity: ReportingGranularity.Day,
            }),
        [timezone, filters],
    )

    const csatQuery = useMemo(
        () =>
            averageAiAgentCsatBySkillQueryFactory({
                timezone,
                filters,
                granularity: ReportingGranularity.Day,
            }),
        [timezone, filters],
    )

    const tickets = usePostReportingV2<Row[], Map<string, number | null>>(
        undefined,
        ticketsQuery,
        {
            enabled: isAvailable,
            select: (response) => {
                const map = new Map<string, number | null>()
                ;(response.data.data as Row[]).forEach((row) => {
                    const date = readCubeDateBucket(row)
                    if (!date) return
                    map.set(date, readCubeNumber(row, 'aiAgentTicketVolume'))
                })
                return map
            },
        },
    )

    const csat = usePostReportingV2<Row[], Map<string, number | null>>(
        undefined,
        csatQuery,
        {
            enabled: isAvailable,
            select: (response) => {
                const map = new Map<string, number | null>()
                ;(response.data.data as Row[]).forEach((row) => {
                    const date = readCubeDateBucket(row)
                    if (!date) return
                    map.set(
                        date,
                        roundToOneDecimal(readCubeNumber(row, 'averageCSAT')),
                    )
                })
                return map
            },
        },
    )

    const isLoading = isAvailable && (tickets.isFetching || csat.isFetching)
    const isError = isAvailable && (tickets.isError || csat.isError)

    const data = useMemo<SkillMetricsByDayPoint[] | undefined>(() => {
        if (!isAvailable || isLoading || isError) return undefined
        const dates = new Set<string>([
            ...(tickets.data?.keys() ?? []),
            ...(csat.data?.keys() ?? []),
        ])
        return Array.from(dates)
            .sort()
            .map((date) => ({
                date,
                tickets: tickets.data?.get(date) ?? null,
                csat: csat.data?.get(date) ?? null,
            }))
    }, [isAvailable, isLoading, isError, tickets.data, csat.data])

    return { data, isLoading, isError }
}
