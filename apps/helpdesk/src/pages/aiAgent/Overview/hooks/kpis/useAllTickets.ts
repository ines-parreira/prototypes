import {
    getTrendFetch,
    getTrendHook,
} from 'domains/reporting/hooks/metricTrends'
import { ticketsCreatedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { createdTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsCreated'

export const useAllTickets = getTrendHook(
    ticketsCreatedQueryFactory,
    createdTicketsCountQueryV2Factory,
)

export const fetchAllTickets = getTrendFetch(
    ticketsCreatedQueryFactory,
    createdTicketsCountQueryV2Factory,
)
