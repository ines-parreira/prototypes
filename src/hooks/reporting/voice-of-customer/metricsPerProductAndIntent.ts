import {
    fetchMetricPerDimension,
    MetricWithDecile,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import {
    ticketCountPerIntentForProductQueryFactory,
    ticketCountPerIntentQueryFactory,
} from 'models/reporting/queryFactories/voice-of-customer/ticketCountPerIntent'
import { StatsFilters } from 'models/stat/types'

export const useTicketCountPerIntent = (
    statsFilters: StatsFilters,
    timezone: string,
    intentsCustomFieldId: string,
    productId?: string,
    sorting?: OrderDirection,
): MetricWithDecile => {
    return useMetricPerDimension(
        ticketCountPerIntentQueryFactory(
            statsFilters,
            timezone,
            intentsCustomFieldId,
            sorting,
        ),
        productId,
    )
}

export const fetchTicketCountPerIntent = (
    statsFilters: StatsFilters,
    timezone: string,
    intentsCustomFieldId: string,
    productId?: string,
    sorting?: OrderDirection,
) =>
    fetchMetricPerDimension(
        ticketCountPerIntentQueryFactory(
            statsFilters,
            timezone,
            intentsCustomFieldId,
            sorting,
        ),
        productId,
    )

export const useTicketCountPerIntentForProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    intentsCustomFieldId: string,
    productId: string,
    sorting?: OrderDirection,
    intentsCustomFieldValueString?: string,
) => {
    return useMetricPerDimension(
        ticketCountPerIntentForProductQueryFactory(
            statsFilters,
            timezone,
            intentsCustomFieldId,
            productId,
            sorting,
        ),
        intentsCustomFieldValueString,
    )
}
