/**
 * Per-skill table aggregates: one query each for tickets / handover / csat,
 * each grouped by (resourceSourceSetId, resourceSourceId). Returned as a map
 * keyed by `${resourceSourceSetId}-${resourceSourceId}` so the Skills table
 * can populate every row from a single fan-out.
 *
 * Table-side counterpart of `useSkillMetrics`, which fetches one skill at a
 * time (and powers the Performance side panel). Both hooks read from the
 * same Family B cubes through the `TicketInsightsSkillParticipation` helper,
 * so the numbers line up by construction.
 */

import { useMemo } from 'react'

import { usePostReportingV2 } from 'domains/reporting/models/queries'
import { averageAiAgentCsatPerSkillQueryFactory } from 'domains/reporting/models/scopes/aiAgentCsat'
import { aiAgentTicketVolumePerSkillQueryFactory } from 'domains/reporting/models/scopes/aiAgentSuccessRate'
import { handoverInteractionsPerSkillQueryFactory } from 'domains/reporting/models/scopes/handoverInteractions'
import type { ApiStatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    readCubeNumber,
    roundToOneDecimal,
} from 'domains/reporting/utils/reporting'
import { useAppSelector } from 'hooks/useAppSelector'
import { getTimezone } from 'state/currentUser/selectors'

type DateRange = {
    start_datetime: string
    end_datetime: string
}

type Row = Record<string, unknown>

export const skillKey = (
    resourceSourceSetId: string | number,
    resourceSourceId: string | number,
): string => `${resourceSourceSetId}-${resourceSourceId}`

export type SkillAggregateMetrics = {
    tickets: number | null
    handoverTickets: number | null
    csat: number | null
}

type UseSkillsAggregateMetricsParams = {
    shopIntegrationId: number
    dateRange: DateRange
    enabled?: boolean
}

type UseSkillsAggregateMetricsResult = {
    data: Map<string, SkillAggregateMetrics> | undefined
    isLoading: boolean
    isError: boolean
}

const buildFilters = (
    shopIntegrationId: number,
    period: DateRange,
): ApiStatsFilters => ({
    [FilterKey.Period]: period,
    [FilterKey.Stores]: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [shopIntegrationId],
    },
})

const parseByKey = (
    rows: Row[],
    measureKey: string,
    transform: (value: number) => number | null = (value) => value,
): Map<string, number> => {
    const map = new Map<string, number>()
    rows.forEach((row) => {
        const setId = row['resourceSourceSetId']
        const sourceId = row['resourceSourceId']
        if (setId == null || sourceId == null) return
        const raw = readCubeNumber(row, measureKey)
        if (raw == null) return
        const value = transform(raw)
        if (value == null) return
        map.set(skillKey(String(setId), String(sourceId)), value)
    })
    return map
}

export const useSkillsAggregateMetrics = ({
    shopIntegrationId,
    dateRange,
    enabled = true,
}: UseSkillsAggregateMetricsParams): UseSkillsAggregateMetricsResult => {
    const timezone = useAppSelector(getTimezone) ?? 'UTC'

    const isAvailable = enabled && !!shopIntegrationId && !!dateRange

    const filters = useMemo(
        () => buildFilters(shopIntegrationId, dateRange),
        [shopIntegrationId, dateRange],
    )

    const ticketsQuery = useMemo(
        () =>
            aiAgentTicketVolumePerSkillQueryFactory({
                timezone,
                filters,
            }),
        [timezone, filters],
    )

    const handoverQuery = useMemo(
        () =>
            handoverInteractionsPerSkillQueryFactory({
                timezone,
                filters,
            }),
        [timezone, filters],
    )

    const csatQuery = useMemo(
        () =>
            averageAiAgentCsatPerSkillQueryFactory({
                timezone,
                filters,
            }),
        [timezone, filters],
    )

    const tickets = usePostReportingV2<Row[], Map<string, number>>(
        undefined,
        ticketsQuery,
        {
            enabled: isAvailable,
            select: (response) =>
                parseByKey(response.data.data as Row[], 'aiAgentTicketVolume'),
        },
    )

    const handover = usePostReportingV2<Row[], Map<string, number>>(
        undefined,
        handoverQuery,
        {
            enabled: isAvailable,
            select: (response) =>
                parseByKey(
                    response.data.data as Row[],
                    'handoverInteractionsCount',
                ),
        },
    )

    const csat = usePostReportingV2<Row[], Map<string, number>>(
        undefined,
        csatQuery,
        {
            enabled: isAvailable,
            select: (response) =>
                parseByKey(
                    response.data.data as Row[],
                    'averageCSAT',
                    roundToOneDecimal,
                ),
        },
    )

    const isLoading =
        isAvailable &&
        (tickets.isFetching || handover.isFetching || csat.isFetching)

    const isError =
        isAvailable && (tickets.isError || handover.isError || csat.isError)

    const data = useMemo<Map<string, SkillAggregateMetrics> | undefined>(() => {
        if (!isAvailable || isLoading || isError) return undefined
        const merged = new Map<string, SkillAggregateMetrics>()
        const allKeys = new Set<string>([
            ...(tickets.data?.keys() ?? []),
            ...(handover.data?.keys() ?? []),
            ...(csat.data?.keys() ?? []),
        ])
        allKeys.forEach((key) => {
            merged.set(key, {
                tickets: tickets.data?.get(key) ?? null,
                handoverTickets: handover.data?.get(key) ?? null,
                csat: csat.data?.get(key) ?? null,
            })
        })
        return merged
    }, [
        isAvailable,
        isLoading,
        isError,
        tickets.data,
        handover.data,
        csat.data,
    ])

    return { data, isLoading, isError }
}
