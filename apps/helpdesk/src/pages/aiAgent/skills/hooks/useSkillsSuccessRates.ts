/**
 * Per-skill success rate map for the Skills page table.
 *
 * Two Cube.js queries (current period + prior period of equal length), each
 * grouped by (resourceSourceSetId, resourceSourceId) through the
 * TicketInsightsSkillParticipation helper. Returns a map keyed by
 * `${resourceSourceSetId}-${resourceSourceId}` so the table can look up both
 * the rate and the trend delta for each row without firing N queries.
 */

import { useMemo } from 'react'

import { usePostReportingV2 } from 'domains/reporting/models/queries'
import { aiAgentSuccessRatePerSkillQueryFactory } from 'domains/reporting/models/scopes/aiAgentSuccessRate'
import type { ApiStatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
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

export type SkillSuccessRate = {
    value: number | null
    prevValue: number | null
}

type UseSkillsSuccessRatesParams = {
    shopIntegrationId: number
    dateRange: DateRange
    enabled?: boolean
}

type UseSkillsSuccessRatesResult = {
    data: Map<string, SkillSuccessRate> | undefined
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

const parseRatesByKey = (rows: Row[]): Map<string, number> => {
    const map = new Map<string, number>()
    rows.forEach((row) => {
        const setId = row['resourceSourceSetId']
        const sourceId = row['resourceSourceId']
        const rate = row['successRate']
        if (setId == null || sourceId == null || rate == null) return
        const value = Number(rate)
        if (!Number.isFinite(value)) return
        map.set(skillKey(String(setId), String(sourceId)), value)
    })
    return map
}

export const useSkillsSuccessRates = ({
    shopIntegrationId,
    dateRange,
    enabled = true,
}: UseSkillsSuccessRatesParams): UseSkillsSuccessRatesResult => {
    const timezone = useAppSelector(getTimezone) ?? 'UTC'

    const isAvailable = enabled && !!shopIntegrationId && !!dateRange

    const prevPeriod = useMemo(() => getPreviousPeriod(dateRange), [dateRange])

    const currentFilters = useMemo(
        () => buildFilters(shopIntegrationId, dateRange),
        [shopIntegrationId, dateRange],
    )

    const prevFilters = useMemo(
        () => buildFilters(shopIntegrationId, prevPeriod),
        [shopIntegrationId, prevPeriod],
    )

    const currentQuery = useMemo(
        () =>
            aiAgentSuccessRatePerSkillQueryFactory({
                timezone,
                filters: currentFilters,
            }),
        [timezone, currentFilters],
    )

    const prevQuery = useMemo(
        () =>
            aiAgentSuccessRatePerSkillQueryFactory({
                timezone,
                filters: prevFilters,
            }),
        [timezone, prevFilters],
    )

    const current = usePostReportingV2<Row[], Map<string, number>>(
        undefined,
        currentQuery,
        {
            enabled: isAvailable,
            select: (response) => parseRatesByKey(response.data.data as Row[]),
        },
    )

    const prev = usePostReportingV2<Row[], Map<string, number>>(
        undefined,
        prevQuery,
        {
            enabled: isAvailable,
            select: (response) => parseRatesByKey(response.data.data as Row[]),
        },
    )

    const data = useMemo<Map<string, SkillSuccessRate> | undefined>(() => {
        if (!isAvailable || current.isFetching || prev.isFetching)
            return undefined
        const merged = new Map<string, SkillSuccessRate>()
        const allKeys = new Set<string>([
            ...(current.data?.keys() ?? []),
            ...(prev.data?.keys() ?? []),
        ])
        allKeys.forEach((key) => {
            merged.set(key, {
                value: current.data?.get(key) ?? null,
                prevValue: prev.data?.get(key) ?? null,
            })
        })
        return merged
    }, [
        isAvailable,
        current.isFetching,
        prev.isFetching,
        current.data,
        prev.data,
    ])

    return {
        data,
        isLoading: isAvailable && (current.isFetching || prev.isFetching),
        isError: isAvailable && (current.isError || prev.isError),
    }
}
