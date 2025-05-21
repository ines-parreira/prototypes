import {
    createFetchPerDimension,
    createMetricPerDimensionHook,
} from 'hooks/reporting/helpers'
import { ticketCountPerProductQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/ticketsWithProducts'

export const useTicketCountPerProduct = createMetricPerDimensionHook(
    ticketCountPerProductQueryFactory,
)
export const fetchTicketCountPerProduct = createFetchPerDimension(
    ticketCountPerProductQueryFactory,
)
