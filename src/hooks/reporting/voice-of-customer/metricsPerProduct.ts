import {
    createFetchPerDimension,
    createMetricPerDimensionHook,
} from 'hooks/reporting/helpers'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import { returnMentionsPerProductQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/returnMentionsPerProduct'
import { ticketCountPerProductQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/ticketsWithProducts'
import { StatsFilters } from 'models/stat/types'

export const useTicketCountPerProduct = createMetricPerDimensionHook(
    ticketCountPerProductQueryFactory,
)
export const fetchTicketCountPerProduct = createFetchPerDimension(
    ticketCountPerProductQueryFactory,
)

export const useReturnMentionsPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    intentsCustomFieldId: string,
    sorting?: OrderDirection,
    productId?: string,
) =>
    useMetricPerDimension(
        returnMentionsPerProductQueryFactory(
            statsFilters,
            timezone,
            intentsCustomFieldId,
            sorting,
        ),
        productId,
    )

export const fetchReturnMentionsPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    intentsCustomFieldId: string,
    sorting?: OrderDirection,
    productId?: string,
) =>
    fetchMetricPerDimension(
        returnMentionsPerProductQueryFactory(
            statsFilters,
            timezone,
            intentsCustomFieldId,
            sorting,
        ),
        productId,
    )
