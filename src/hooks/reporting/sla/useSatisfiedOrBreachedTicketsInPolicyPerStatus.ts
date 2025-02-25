import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { OrderDirection } from 'models/api/types'
import { SatisfiedOrBreachedTicketSLAStatus } from 'models/reporting/cubes/sla/TicketSLACube'
import { satisfiedOrBreachedTicketsQueryFactory } from 'models/reporting/queryFactories/sla/satisfiedOrBreachedTickets'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

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
