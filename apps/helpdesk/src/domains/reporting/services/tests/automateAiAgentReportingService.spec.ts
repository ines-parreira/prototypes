import { assumeMock } from '@repo/testing'
import { saveZippedFiles } from '@repo/utils'
import moment from 'moment'

import { AutomateStatsMeasureLabelMap } from 'domains/reporting/hooks/automate/automateStatsMeasureLabelMap'
import { getData as getPerformanceData } from 'domains/reporting/services/agentsPerformanceReportingService'
import { saveReport } from 'domains/reporting/services/automateAiAgentReportingService'
import { formatPerformanceFeatureData } from 'domains/reporting/services/automateOverviewReportingService'
import { DATE_TIME_FORMAT } from 'domains/reporting/services/constants'
import { formatData as getTicketInsightsData } from 'domains/reporting/services/ticketFieldsReportingService'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'
import { agents } from 'fixtures/agents'
import { OrderDirection } from 'models/api/types'

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    createCsv: (value: string) => `${value}-csv`,
    saveZippedFiles: jest.fn(),
}))
const saveZippedFilesMock = assumeMock(saveZippedFiles)

jest.mock(
    'domains/reporting/services/agentsPerformanceReportingService',
    () => ({
        getData: jest.fn(() => 'performance-data'),
    }),
)
const getPerformanceDataMock = assumeMock(getPerformanceData)

jest.mock('domains/reporting/services/ticketFieldsReportingService', () => ({
    formatData: jest.fn(() => 'ticket-insights-data'),
}))
const getTicketInsightsDataMock = assumeMock(getTicketInsightsData)

jest.mock('domains/reporting/services/automateOverviewReportingService')
const getPerformanceFeatureDataMock = assumeMock(formatPerformanceFeatureData)

const period = {
    start_datetime: '2024-09-21',
    end_datetime: '2024-09-27',
}

const buildMetric = (data: any) => ({
    data,
    isFetching: false,
    isError: false,
})

const metricBuilder = (data: any) => ({
    closedTicketsMetric: buildMetric(data),
    customerSatisfactionMetric: buildMetric(data),
    medianFirstResponseTimeMetric: buildMetric(data),
    humanResponseTimeAfterAiHandoffMetric: buildMetric(data),
    medianResponseTimeMetric: buildMetric(data),
    messagesSentMetric: buildMetric(data),
    messagesReceivedMetric: buildMetric(data),
    percentageOfClosedTicketsMetric: buildMetric(data),
    medianResolutionTimeMetric: buildMetric(data),
    ticketsRepliedMetric: buildMetric(data),
    oneTouchTicketsMetric: buildMetric(data),
    zeroTouchTicketsMetric: buildMetric(data),
    repliedTicketsPerHourMetric: buildMetric(data),
    onlineTimeMetric: buildMetric(data),
    messagesSentPerHourMetric: buildMetric(data),
    closedTicketsPerHourMetric: buildMetric(data),
    ticketHandleTimeMetric: buildMetric(data),
})

const performance = {
    data: {
        ...metricBuilder({
            value: 1,
            decile: 0,
            allData: [
                {
                    dimension: 'ticketCount',
                    value: '123',
                },
            ],
        }),
        agents: [],
    },
    summary: metricBuilder({ value: 129 }),
    total: metricBuilder({ value: 230 }),
    columnsOrder: [AgentsTableColumn.AgentName],
    rowsOrder: [],
}

const timeSeriesData = {
    dateTime: '2024-09-21',
    value: 4,
}

const ticketInsights = {
    data: {},
    dateTimes: [
        'Sat, Sep 21',
        'Sun, Sep 22',
        'Mon, Sep 23',
        'Tue, Sep 24',
        'Wed, Sep 25',
        'Thu, Sep 26',
        'Fri, Sep 27',
    ],
    order: OrderDirection.Asc,
}

describe('automateAiAgentReportingService', () => {
    beforeEach(() => {
        getPerformanceFeatureDataMock.mockReturnValue([
            ['performance-feature-data'],
        ])
    })
    describe('saveReport', () => {
        it('should call saveZippedFiles with the correct values', async () => {
            const automateStatsMeasureLabelMap = AutomateStatsMeasureLabelMap

            const automatedTickets = {
                automateStatsMeasureLabelMap,
                automatedInteractionByEventTypesTimeSeries: [[timeSeriesData]],
            }

            await saveReport(
                agents,
                period,
                performance,
                automatedTickets,
                ticketInsights,
            )

            expect(getPerformanceDataMock).toHaveBeenCalledWith(
                agents,
                performance.data,
                performance.summary,
                performance.total,
                performance.columnsOrder,
                [],
            )
            expect(getTicketInsightsDataMock).toHaveBeenCalledWith(
                ticketInsights.data,
                ticketInsights.dateTimes,
                ticketInsights.order,
            )
            expect(getPerformanceFeatureDataMock).toHaveBeenCalledWith(
                automatedTickets.automateStatsMeasureLabelMap,
                automatedTickets.automatedInteractionByEventTypesTimeSeries,
            )

            const downloadDate = moment().format(DATE_TIME_FORMAT)

            expect(saveZippedFilesMock).toBeCalledWith(
                {
                    [`2024-09-21_2024-09-27-ai-agent-performance-${downloadDate}.csv`]:
                        'performance-data-csv',
                    [`2024-09-21_2024-09-27-ai-agent-ticket-insights-${downloadDate}.csv`]:
                        'ticket-insights-data-csv',
                    [`2024-09-21_2024-09-27-ai-agent-automated-tickets-${downloadDate}.csv`]:
                        'performance-feature-data-csv',
                },
                `2024-09-21_2024-09-27-ai-agent-metrics-${downloadDate}`,
            )
        })

        it('should call saveZippedFiles without ticket insights when those are not set', async () => {
            const automateStatsMeasureLabelMap = AutomateStatsMeasureLabelMap

            const automatedTickets = {
                automateStatsMeasureLabelMap,
                automatedInteractionByEventTypesTimeSeries: [[timeSeriesData]],
            }

            await saveReport(agents, period, performance, automatedTickets)

            const downloadDate = moment().format(DATE_TIME_FORMAT)

            expect(saveZippedFilesMock).toBeCalledWith(
                {
                    [`2024-09-21_2024-09-27-ai-agent-performance-${downloadDate}.csv`]:
                        'performance-data-csv',
                    [`2024-09-21_2024-09-27-ai-agent-automated-tickets-${downloadDate}.csv`]:
                        'performance-feature-data-csv',
                },
                `2024-09-21_2024-09-27-ai-agent-metrics-${downloadDate}`,
            )
        })
    })
})
