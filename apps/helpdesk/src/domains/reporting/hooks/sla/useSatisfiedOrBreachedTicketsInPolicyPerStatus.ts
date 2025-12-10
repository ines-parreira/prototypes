import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import type { SatisfiedOrBreachedTicketSLAStatus } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { satisfiedOrBreachedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/sla/satisfiedOrBreachedTickets'
import { satisfiedOrBreachedTicketsQueryV2Factory } from 'domains/reporting/models/scopes/ticketSLA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

export const useSatisfiedOrBreachedTicketsInPolicyPerStatus = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    slaStatus?: SatisfiedOrBreachedTicketSLAStatus,
) =>
    useMetricPerDimensionV2(
        satisfiedOrBreachedTicketsQueryFactory(statsFilters, timezone, sorting),
        satisfiedOrBreachedTicketsQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        slaStatus,
    )

export const useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    slaStatus?: SatisfiedOrBreachedTicketSLAStatus,
): MetricTrend => {
    const currentPeriod = useMetricPerDimensionV2(
        satisfiedOrBreachedTicketsQueryFactory(statsFilters, timezone, sorting),
        satisfiedOrBreachedTicketsQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        slaStatus,
    )
    const previousPeriod = useMetricPerDimensionV2(
        satisfiedOrBreachedTicketsQueryFactory(
            {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone,
            sorting,
        ),
        satisfiedOrBreachedTicketsQueryV2Factory({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone,
            sortDirection: sorting,
        }),
        slaStatus,
    )

    return {
        data: {
            prevValue: previousPeriod.data?.value ?? null,
            value: currentPeriod.data?.value ?? null,
        },
        isError: currentPeriod.isError || previousPeriod.isError,
        isFetching: currentPeriod.isFetching || previousPeriod.isFetching,
    }
}

export const fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend = async (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    slaStatus?: SatisfiedOrBreachedTicketSLAStatus,
): Promise<MetricTrend> => {
    const currentPeriod = await fetchMetricPerDimensionV2(
        satisfiedOrBreachedTicketsQueryFactory(statsFilters, timezone, sorting),
        satisfiedOrBreachedTicketsQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        slaStatus,
    )
    const previousPeriod = await fetchMetricPerDimensionV2(
        satisfiedOrBreachedTicketsQueryFactory(
            {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone,
            sorting,
        ),
        satisfiedOrBreachedTicketsQueryV2Factory({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone,
            sortDirection: sorting,
        }),
        slaStatus,
    )

    return {
        data: {
            prevValue: previousPeriod.data?.value ?? null,
            value: currentPeriod.data?.value ?? null,
        },
        isError: currentPeriod.isError || previousPeriod.isError,
        isFetching: currentPeriod.isFetching || previousPeriod.isFetching,
    }
}
