import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {OrderDirection} from 'models/api/types'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {slaTicketsQueryFactory} from 'models/reporting/queryFactories/sla/slaTickets'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useTicketsInPolicyPerStatus = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    slaStatus?: TicketSLAStatus
) =>
    useMetricPerDimension(
        slaTicketsQueryFactory(statsFilters, timezone, sorting),
        slaStatus
    )

export const useTicketsInPolicyPerStatusTrend = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    slaStatus?: TicketSLAStatus
): MetricTrend => {
    const currentPeriod = useMetricPerDimension(
        slaTicketsQueryFactory(statsFilters, timezone, sorting),
        slaStatus
    )
    const previousPeriod = useMetricPerDimension(
        slaTicketsQueryFactory(
            {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone,
            sorting
        ),
        slaStatus
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
