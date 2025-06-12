import {
    fetchMetricPerDimension,
    MetricWithDecile,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import {
    ticketCountPerIntentForProductQueryFactory,
    ticketCountPerIntentQueryFactory,
    TicketsPerIntentOrderField,
} from 'models/reporting/queryFactories/voice-of-customer/ticketCountPerIntent'
import { StatsFilters } from 'models/stat/types'

export const useTicketCountPerIntent = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    productId?: string,
    sorting?: OrderDirection,
): MetricWithDecile => {
    return useMetricPerDimension(
        ticketCountPerIntentQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            sorting,
        ),
        productId,
    )
}

export const fetchTicketCountPerIntentForProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    productId?: string,
    sorting?: OrderDirection,
) =>
    fetchMetricPerDimension(
        ticketCountPerIntentQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            sorting,
        ),
        productId,
    )

export const useTicketCountPerIntentForProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    productId: string,
    sorting?: OrderDirection,
    intentsCustomFieldValueString?: string,
    sortingField?: TicketsPerIntentOrderField,
) => {
    return useMetricPerDimension(
        ticketCountPerIntentForProductQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            productId,
            sorting,
            sortingField,
        ),
        intentsCustomFieldValueString,
    )
}
