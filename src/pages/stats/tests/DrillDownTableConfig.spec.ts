import moment from 'moment/moment'
import {customerSatisfactionMetricDrillDownQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {StatsFilters} from 'models/stat/types'
import {getDrillDownQuery} from 'pages/stats/DrillDownTableConfig'
import {AgentsMetrics, DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {
    OverviewMetric,
    TableColumn,
    TicketFieldsMetric,
} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'

jest.mock(
    'models/reporting/queryFactories/support-performance/customerSatisfaction'
)
const customerSatisfactionQueryFactoryMock = assumeMock(
    customerSatisfactionMetricDrillDownQueryFactory
)
describe('getDrillDownQuery', () => {
    const agentsMetrics: AgentsMetrics[] = [
        {metricName: TableColumn.CustomerSatisfaction, perAgentId: 123},
        {metricName: TableColumn.MedianFirstResponseTime, perAgentId: 123},
        {metricName: TableColumn.MedianResolutionTime, perAgentId: 123},
        {metricName: TableColumn.MessagesSent, perAgentId: 123},
        {metricName: TableColumn.PercentageOfClosedTickets, perAgentId: 123},
        {metricName: TableColumn.ClosedTickets, perAgentId: 123},
        {metricName: TableColumn.RepliedTickets, perAgentId: 123},
        {metricName: TableColumn.OneTouchTickets, perAgentId: 123},
    ]
    const supportedMetrics: DrillDownMetric[] = [
        {
            metricName: TicketFieldsMetric.TicketCustomFieldsTicketCount,
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
        {metricName: OverviewMetric.OneTouchTickets},
    ]

    it.each([...supportedMetrics, ...agentsMetrics])(
        'should return a query for every DrillDown metric: $metricName',
        (metricName: DrillDownMetric) => {
            expect(getDrillDownQuery(metricName)).toEqual(expect.any(Function))
        }
    )

    it('should be populated with agentId filter ($metricName_', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric = agentsMetrics[0]

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(customerSatisfactionQueryFactoryMock).toHaveBeenCalledWith(
            expect.objectContaining({agents: [drillDownMetric.perAgentId]}),
            timezone,
            undefined
        )
    })
})
