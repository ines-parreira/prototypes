/**
 * Per-skill aggregate metrics (Volume, Handovers, CSAT) for the Skills page
 * side panel. Family B per-skill cubes joined through the
 * `TicketInsightsSkillParticipation` helper.
 *
 * Each metric is its own Cube.js query — combining measures from multiple
 * Family B cubes through the helper makes Cube.js intersect to tickets in
 * all cubes, dropping handover tickets via CSAT's HAVING clause.
 */

import { useMemo } from 'react'

import { usePostReportingV2 } from 'domains/reporting/models/queries'
import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { averageAiAgentCsatBySkillQueryFactory } from 'domains/reporting/models/scopes/aiAgentCsat'
import { aiAgentTicketVolumeBySkillQueryFactory } from 'domains/reporting/models/scopes/aiAgentSuccessRate'
import { handoverInteractionsBySkillQueryFactory } from 'domains/reporting/models/scopes/handoverInteractions'
import type { ApiStatsFilters } from 'domains/reporting/models/stat/types'
import {
    APIOnlyFilterKey,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    getPreviousPeriod,
    readCubeNumber,
    roundToOneDecimal,
} from 'domains/reporting/utils/reporting'
import { useAppSelector } from 'hooks/useAppSelector'
import { getTimezone } from 'state/currentUser/selectors'

type DateRange = {
    start_datetime: string
    end_datetime: string
}

export type SkillMetricsData = {
    tickets: number | null
    prevTickets: number | null
    handoverTickets: number | null
    prevHandoverTickets: number | null
    csat: number | null
    prevCsat: number | null
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

type UseSkillsMetricsParams = {
    shopIntegrationId: number
    resourceSourceId: number
    resourceSourceSetId: number
    enabled?: boolean
    dateRange?: DateRange
}

type UseSkillsMetricsResult = {
    data: SkillMetricsData | undefined
    isLoading: boolean
    isError: boolean
}

export const useSkillMetrics = ({
    shopIntegrationId,
    resourceSourceId,
    resourceSourceSetId,
    enabled = true,
    dateRange,
}: UseSkillsMetricsParams): UseSkillsMetricsResult => {
    const timezone = useAppSelector(getTimezone) ?? 'UTC'

    const defaultDateRange = useMemo(() => getLast28DaysDateRange(), [])
    const period = dateRange ?? defaultDateRange

    const isAvailable =
        enabled &&
        !!shopIntegrationId &&
        !!resourceSourceId &&
        !!resourceSourceSetId

    const prevPeriod = useMemo(() => getPreviousPeriod(period), [period])

    const currentFilters = useMemo(
        () =>
            buildSkillFilters(
                shopIntegrationId,
                resourceSourceId,
                resourceSourceSetId,
                period,
            ),
        [shopIntegrationId, resourceSourceId, resourceSourceSetId, period],
    )

    const prevFilters = useMemo(
        () =>
            buildSkillFilters(
                shopIntegrationId,
                resourceSourceId,
                resourceSourceSetId,
                prevPeriod,
            ),
        [shopIntegrationId, resourceSourceId, resourceSourceSetId, prevPeriod],
    )

    const ticketsCurrentQuery = useMemo(
        () =>
            aiAgentTicketVolumeBySkillQueryFactory({
                timezone,
                filters: currentFilters,
            }),
        [timezone, currentFilters],
    )

    const ticketsPrevQuery = useMemo(
        () =>
            aiAgentTicketVolumeBySkillQueryFactory({
                timezone,
                filters: prevFilters,
            }),
        [timezone, prevFilters],
    )

    const handoverCurrentQuery = useMemo(
        () =>
            handoverInteractionsBySkillQueryFactory({
                timezone,
                filters: currentFilters,
            }),
        [timezone, currentFilters],
    )

    const handoverPrevQuery = useMemo(
        () =>
            handoverInteractionsBySkillQueryFactory({
                timezone,
                filters: prevFilters,
            }),
        [timezone, prevFilters],
    )

    const csatCurrentQuery = useMemo(
        () =>
            averageAiAgentCsatBySkillQueryFactory({
                timezone,
                filters: currentFilters,
            }),
        [timezone, currentFilters],
    )

    const csatPrevQuery = useMemo(
        () =>
            averageAiAgentCsatBySkillQueryFactory({
                timezone,
                filters: prevFilters,
            }),
        [timezone, prevFilters],
    )

    const tickets = usePostReportingV2<Row[], number | null>(
        undefined,
        ticketsCurrentQuery,
        {
            enabled: isAvailable,
            select: (response) =>
                readCubeNumber(
                    (response.data.data as Row[])[0],
                    'aiAgentTicketVolume',
                ),
        },
    )

    const prevTickets = usePostReportingV2<Row[], number | null>(
        undefined,
        ticketsPrevQuery,
        {
            enabled: isAvailable,
            select: (response) =>
                readCubeNumber(
                    (response.data.data as Row[])[0],
                    'aiAgentTicketVolume',
                ),
        },
    )

    const handover = usePostReportingV2<Row[], number | null>(
        undefined,
        handoverCurrentQuery,
        {
            enabled: isAvailable,
            select: (response) =>
                readCubeNumber(
                    (response.data.data as Row[])[0],
                    'handoverInteractionsCount',
                ),
        },
    )

    const prevHandover = usePostReportingV2<Row[], number | null>(
        undefined,
        handoverPrevQuery,
        {
            enabled: isAvailable,
            select: (response) =>
                readCubeNumber(
                    (response.data.data as Row[])[0],
                    'handoverInteractionsCount',
                ),
        },
    )

    const csat = usePostReportingV2<Row[], number | null>(
        undefined,
        csatCurrentQuery,
        {
            enabled: isAvailable,
            select: (response) =>
                roundToOneDecimal(
                    readCubeNumber(
                        (response.data.data as Row[])[0],
                        'averageCSAT',
                    ),
                ),
        },
    )

    const prevCsat = usePostReportingV2<Row[], number | null>(
        undefined,
        csatPrevQuery,
        {
            enabled: isAvailable,
            select: (response) =>
                roundToOneDecimal(
                    readCubeNumber(
                        (response.data.data as Row[])[0],
                        'averageCSAT',
                    ),
                ),
        },
    )

    const isLoading =
        isAvailable &&
        (tickets.isFetching ||
            prevTickets.isFetching ||
            handover.isFetching ||
            prevHandover.isFetching ||
            csat.isFetching ||
            prevCsat.isFetching)

    const isError =
        isAvailable &&
        (tickets.isError ||
            prevTickets.isError ||
            handover.isError ||
            prevHandover.isError ||
            csat.isError ||
            prevCsat.isError)

    const data = useMemo<SkillMetricsData | undefined>(() => {
        if (!isAvailable || isLoading || isError) return undefined
        return {
            tickets: tickets.data ?? null,
            prevTickets: prevTickets.data ?? null,
            handoverTickets: handover.data ?? null,
            prevHandoverTickets: prevHandover.data ?? null,
            csat: csat.data ?? null,
            prevCsat: prevCsat.data ?? null,
        }
    }, [
        isAvailable,
        isLoading,
        isError,
        tickets.data,
        prevTickets.data,
        handover.data,
        prevHandover.data,
        csat.data,
        prevCsat.data,
    ])

    return { data, isLoading, isError }
}
