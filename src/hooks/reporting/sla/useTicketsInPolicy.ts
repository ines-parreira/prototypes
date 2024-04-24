import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {slaTicketsQueryFactory} from 'models/reporting/queryFactories/sla/slaTickets'
import {StatsFilters} from 'models/stat/types'

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
