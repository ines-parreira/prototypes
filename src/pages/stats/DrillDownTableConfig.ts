import {OrderDirection} from 'models/api/types'

import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {closedTicketsPerTicketQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customerSatisfactionMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {medianFirstResponseTimeMetricPerTicketQueryFactory} from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import {medianResolutionTimeMetricPerTicketQueryFactory} from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import {messagesSentMetricPerTicketQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {oneTouchTicketsPerTicketQueryFactory} from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import {openTicketsPerTicketQueryFactory} from 'models/reporting/queryFactories/support-performance/openTickets'
import {ticketsCreatedPerTicketQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {ticketsRepliedMetricPerTickerQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {customFieldsTicketCountPerTicketQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {StatsFilters} from 'models/stat/types'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {OverviewMetric, TableColumn} from 'state/ui/stats/types'
import {agentFilter, withFilter} from 'utils/reporting'

export const getDrillDownQuery = (metricName: DrillDownMetric) => {
    switch (metricName.metricName) {
        case OverviewMetric.CustomerSatisfaction:
            return customerSatisfactionMetricPerAgentQueryFactory
        case TableColumn.CustomerSatisfaction:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection
            ) =>
                withFilter(
                    customerSatisfactionMetricPerAgentQueryFactory(
                        statsFilters,
                        timezone,
                        sorting
                    ),
                    agentFilter(String(metricName.perAgentId))
                )
        case TableColumn.MedianFirstResponseTime:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection
            ) =>
                withFilter(
                    medianFirstResponseTimeMetricPerTicketQueryFactory(
                        statsFilters,
                        timezone,
                        sorting
                    ),
                    agentFilter(String(metricName.perAgentId))
                )
        case OverviewMetric.MedianFirstResponseTime:
            return medianFirstResponseTimeMetricPerTicketQueryFactory
        case TableColumn.MedianResolutionTime:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection
            ) =>
                withFilter(
                    medianResolutionTimeMetricPerTicketQueryFactory(
                        statsFilters,
                        timezone,
                        sorting
                    ),
                    agentFilter(String(metricName.perAgentId))
                )
        case OverviewMetric.MedianResolutionTime:
            return medianResolutionTimeMetricPerTicketQueryFactory
        case OverviewMetric.MessagesPerTicket:
        case OverviewMetric.MessagesSent:
            return messagesSentMetricPerTicketQueryFactory
        case TableColumn.MessagesSent:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection
            ) =>
                withFilter(
                    messagesSentMetricPerTicketQueryFactory(
                        statsFilters,
                        timezone,
                        sorting
                    ),
                    agentFilter(String(metricName.perAgentId))
                )
        case TableColumn.PercentageOfClosedTickets:
        case TableColumn.ClosedTickets:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection
            ) =>
                withFilter(
                    closedTicketsPerTicketQueryFactory(
                        statsFilters,
                        timezone,
                        sorting
                    ),
                    agentFilter(String(metricName.perAgentId))
                )
        case OverviewMetric.TicketsClosed:
            return closedTicketsPerTicketQueryFactory
        case OverviewMetric.TicketsReplied:
            return ticketsRepliedMetricPerTickerQueryFactory
        case TableColumn.RepliedTickets:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection
            ) =>
                withFilter(
                    ticketsRepliedMetricPerTickerQueryFactory(
                        statsFilters,
                        timezone,
                        sorting
                    ),
                    agentFilter(String(metricName.perAgentId))
                )
        case TableColumn.OneTouchTickets:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection
            ) =>
                withFilter(
                    oneTouchTicketsPerTicketQueryFactory(
                        statsFilters,
                        timezone,
                        sorting
                    ),
                    agentFilter(String(metricName.perAgentId))
                )
        case TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection
            ) =>
                customFieldsTicketCountPerTicketQueryFactory(
                    statsFilters,
                    timezone,
                    String(metricName.customFieldId),
                    sorting,
                    metricName.customFieldValue || []
                )
        case OverviewMetric.OpenTickets:
            return openTicketsPerTicketQueryFactory
        case OverviewMetric.TicketsCreated:
            return ticketsCreatedPerTicketQueryFactory
    }
}
