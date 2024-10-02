import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'
import {OrderDirection} from 'models/api/types'
import {useAutomateStatsMeasureLabelMap} from 'hooks/reporting/automate/useAutomateStatsMeasureLabelMap'
import {saveReport} from 'services/reporting/automateAiAgentReportingService'
import {AgentsTableColumn} from 'state/ui/stats/types'
import {getData as getPerformanceData} from 'services/reporting/agentsPerformanceReportingService'
import {getData as getTicketInsightsData} from 'services/reporting/ticketFieldsReportingService'
import {getPerformanceFeatureData} from 'services/reporting/automateOverviewReportingService'
import {assumeMock} from 'utils/testing'
import {saveZippedFiles} from 'utils/file'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'

jest.mock('utils/file', () => ({
    createCsv: (value: string) => `${value}-csv`,
    saveZippedFiles: jest.fn(),
}))
const saveZippedFilesMock = assumeMock(saveZippedFiles)

jest.mock('services/reporting/agentsPerformanceReportingService', () => ({
    getData: jest.fn(() => 'performance-data'),
}))
const getPerformanceDataMock = assumeMock(getPerformanceData)

jest.mock('services/reporting/ticketFieldsReportingService', () => ({
    getData: jest.fn(() => 'ticket-insights-data'),
}))
const getTicketInsightsDataMock = assumeMock(getTicketInsightsData)

jest.mock('services/reporting/automateOverviewReportingService', () => ({
    getPerformanceFeatureData: jest.fn(() => 'performance-feature-data'),
}))
const getPerformanceFeatureDataMock = assumeMock(getPerformanceFeatureData)

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
    messagesSentMetric: buildMetric(data),
    percentageOfClosedTicketsMetric: buildMetric(data),
    medianResolutionTimeMetric: buildMetric(data),
    ticketsRepliedMetric: buildMetric(data),
    oneTouchTicketsMetric: buildMetric(data),
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
    summary: metricBuilder({value: 129}),
    columnsOrder: [AgentsTableColumn.AgentName],
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
    describe('saveReport', () => {
        it('should call saveZippedFiles with the correct values', async () => {
            const {result} = renderHook(() => useAutomateStatsMeasureLabelMap())
            const automateStatsMeasureLabelMap = result.current

            const automatedTickets = {
                automateStatsMeasureLabelMap,
                automatedInteractionByEventTypesTimeSeries: [[timeSeriesData]],
            }

            await saveReport(
                period,
                performance,
                automatedTickets,
                ticketInsights
            )

            expect(getPerformanceDataMock).toHaveBeenCalledWith(
                performance.data,
                performance.summary,
                performance.columnsOrder
            )
            expect(getTicketInsightsDataMock).toHaveBeenCalledWith(
                ticketInsights.data,
                ticketInsights.dateTimes,
                ticketInsights.order
            )
            expect(getPerformanceFeatureDataMock).toHaveBeenCalledWith(
                automatedTickets.automateStatsMeasureLabelMap,
                automatedTickets.automatedInteractionByEventTypesTimeSeries
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
                `2024-09-21_2024-09-27-ai-agent-metrics-${downloadDate}`
            )
        })

        it('should call saveZippedFiles without ticket insights when those are not set', async () => {
            const {result} = renderHook(() => useAutomateStatsMeasureLabelMap())
            const automateStatsMeasureLabelMap = result.current

            const automatedTickets = {
                automateStatsMeasureLabelMap,
                automatedInteractionByEventTypesTimeSeries: [[timeSeriesData]],
            }

            await saveReport(period, performance, automatedTickets)

            const downloadDate = moment().format(DATE_TIME_FORMAT)

            expect(saveZippedFilesMock).toBeCalledWith(
                {
                    [`2024-09-21_2024-09-27-ai-agent-performance-${downloadDate}.csv`]:
                        'performance-data-csv',
                    [`2024-09-21_2024-09-27-ai-agent-automated-tickets-${downloadDate}.csv`]:
                        'performance-feature-data-csv',
                },
                `2024-09-21_2024-09-27-ai-agent-metrics-${downloadDate}`
            )
        })
    })
})
