import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'domains/reporting/hooks/useMetricPerDimension'
import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import type { SatisfiedOrBreachedTicketSLAStatus } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { satisfiedOrBreachedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/sla/satisfiedOrBreachedTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

export const useSatisfiedOrBreachedTicketsInPolicyPerStatus = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    slaStatus?: SatisfiedOrBreachedTicketSLAStatus,
) =>
    useMetricPerDimension(
        satisfiedOrBreachedTicketsQueryFactory(statsFilters, timezone, sorting),
        slaStatus,
    )

export const useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    slaStatus?: SatisfiedOrBreachedTicketSLAStatus,
): MetricTrend => {
    const currentPeriod = useMetricPerDimension(
        satisfiedOrBreachedTicketsQueryFactory(statsFilters, timezone, sorting),
        slaStatus,
    )
    const previousPeriod = useMetricPerDimension(
        satisfiedOrBreachedTicketsQueryFactory(
            {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone,
            sorting,
        ),
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
    const currentPeriod = await fetchMetricPerDimension(
        satisfiedOrBreachedTicketsQueryFactory(statsFilters, timezone, sorting),
        slaStatus,
    )
    const previousPeriod = await fetchMetricPerDimension(
        satisfiedOrBreachedTicketsQueryFactory(
            {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone,
            sorting,
        ),
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
