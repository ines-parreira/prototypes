import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {getDrillDownQuery} from 'pages/stats/DrillDownTableConfig'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {OverviewMetric, TableColumn} from 'state/ui/stats/types'

describe('getDrillDownQuery', () => {
    const supportedMetrics: DrillDownMetric[] = [
        {metricName: TableColumn.CustomerSatisfaction, perAgentId: 123},
        {metricName: TableColumn.MedianFirstResponseTime, perAgentId: 123},
        {metricName: TableColumn.MedianResolutionTime, perAgentId: 123},
        {metricName: TableColumn.MessagesSent, perAgentId: 123},
        {metricName: TableColumn.PercentageOfClosedTickets, perAgentId: 123},
        {metricName: TableColumn.ClosedTickets, perAgentId: 123},
        {metricName: TableColumn.RepliedTickets, perAgentId: 123},
        {metricName: TableColumn.OneTouchTickets, perAgentId: 123},
        {
            metricName: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            customFieldId: 123,
            customFieldValue: ['some::customField'],
        },
        {metricName: OverviewMetric.OpenTickets},
        {metricName: OverviewMetric.TicketsClosed},
        {metricName: OverviewMetric.TicketsCreated},
        {metricName: OverviewMetric.TicketsReplied},
        {metricName: OverviewMetric.MessagesSent},
        {metricName: OverviewMetric.MessagesPerTicket},
        {metricName: OverviewMetric.MedianResolutionTime},
        {metricName: OverviewMetric.MedianFirstResponseTime},
        {metricName: OverviewMetric.CustomerSatisfaction},
    ]

    it.each(supportedMetrics)(
        'should return a query for every DrillDown metric: $metricName',
        (metricName: DrillDownMetric) => {
            expect(getDrillDownQuery(metricName)).toEqual(expect.any(Function))
        }
    )
})
