import { aiJourneyTotalNumberOfOrderQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import {
    AiSalesAgentOrdersCube,
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import { DRILLDOWN_QUERY_LIMIT } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const aiJourneyOrdersDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationId: string,
    sorting?: OrderDirection,
    journeyId?: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    ...aiJourneyTotalNumberOfOrderQueryFactory(
        integrationId,
        filters,
        timezone,
        journeyId,
    ),
    measures: [AiSalesAgentOrdersMeasure.GmvUsd],
    dimensions: [
        AiSalesAgentOrdersDimension.TicketId,
        AiSalesAgentOrdersDimension.OrderId,
        AiSalesAgentOrdersDimension.TotalAmount,
        AiSalesAgentOrdersDimension.CustomerId,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[AiSalesAgentOrdersDimension.TicketId, sorting]],
          }
        : {
              order: [],
          }),
})
