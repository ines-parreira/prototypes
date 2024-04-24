import {useTimeSeriesPerDimension} from 'hooks/reporting/useTimeSeries'
import {OrderDirection} from 'models/api/types'
import {slaTicketsTimeSeriesQueryFactory} from 'models/reporting/queryFactories/sla/slaTickets'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

export const useTicketSlaTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection
) => {
    return useTimeSeriesPerDimension(
        slaTicketsTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
            sorting
        )
    )
}
