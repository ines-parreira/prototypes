import moment from 'moment/moment'

import {channels} from 'fixtures/channels'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {Channel} from 'models/channel/types'
import {HandleTimeMeasure} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {HelpdeskMessageMeasure} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMeasure} from 'models/reporting/cubes/TicketMessagesCube'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {CHANNEL_DIMENSION} from 'models/reporting/queryFactories/support-performance/constants'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'
import {
    ChannelsTableLabels,
    columnsOrder,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {
    ChannelsReportMetrics,
    saveReport,
} from 'services/reporting/channelsReportingService'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import * as files from 'utils/file'

jest.mock('utils/file')

describe('channelsReportingService', () => {
    const period = {
        start_datetime: '2023-08-01',
        end_datetime: '2023-08-31',
    }

    const defaultData = {
        channels: [],
        createdTicketsMetricPerChannel: {data: null},
        percentageOfCreatedTicketsMetricPerChannel: {data: null},
        closedTicketsMetricPerChannel: {data: null},
        ticketAverageHandleTimePerChannel: {data: null},
        medianFirstResponseTimeMetricPerChannel: {data: null},
        medianResolutionTimeMetricPerChannel: {data: null},
        ticketsRepliedMetricPerChannel: {data: null},
        messagesSentMetricPerChannel: {data: null},
        customerSatisfactionMetricPerChannel: {data: null},
    } as any

    const channelA = channels[0]
    const channelB = channels[1]
    const reportChannels: Channel[] = [channelA, channelB]

    it('should zip the report', async () => {
        jest.spyOn(files, 'createCsv').mockReturnValue('fakeReport1')
        const zipperMock = jest.spyOn(files, 'saveZippedFiles')

        await saveReport(defaultData, columnsOrder, period)

        expect(zipperMock).toHaveBeenCalledWith(
            {
                [`${period.start_datetime}_${
                    period.end_datetime
                }-channels-metrics-${moment().format(DATE_TIME_FORMAT)}.csv`]:
                    'fakeReport1',
            },
            `${period.start_datetime}_${
                period.end_datetime
            }-channels-metrics-${moment().format(DATE_TIME_FORMAT)}`
        )
    })

    it('should format data', async () => {
        const createCsvSpy = jest
            .spyOn(files, 'createCsv')
            .mockReturnValue('fakeReport1')
        const exampleData = (
            channel: string,
            metricField: ChannelsReportMetrics,
            value: string
        ): MetricWithDecile => ({
            isFetching: false,
            isError: false,
            data: {
                value: 12,
                decile: 4,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: channel,
                        [metricField]: value,
                    },
                ],
            },
        })

        const data = {
            channels: reportChannels,
            createdTicketsMetricPerChannel: exampleData(
                channelA.slug,
                TicketMeasure.TicketCount,
                '5'
            ),
            percentageOfCreatedTicketsMetricPerChannel: exampleData(
                channelA.slug,
                TicketMeasure.TicketCount,
                '5'
            ),
            closedTicketsMetricPerChannel: exampleData(
                channelA.slug,
                TicketMeasure.TicketCount,
                '5'
            ),
            ticketAverageHandleTimePerChannel: exampleData(
                channelA.slug,
                HandleTimeMeasure.AverageHandleTime,
                '5'
            ),
            medianFirstResponseTimeMetricPerChannel: exampleData(
                channelA.slug,
                TicketMessagesMeasure.MedianFirstResponseTime,
                '5'
            ),
            medianResolutionTimeMetricPerChannel: exampleData(
                channelA.slug,
                TicketMessagesMeasure.MedianResolutionTime,
                '5'
            ),
            ticketsRepliedMetricPerChannel: exampleData(
                channelA.slug,
                TicketMeasure.TicketCount,
                '5'
            ),
            messagesSentMetricPerChannel: exampleData(
                channelA.slug,
                HelpdeskMessageMeasure.MessageCount,
                '5'
            ),
            customerSatisfactionMetricPerChannel: exampleData(
                channelA.slug,
                TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                '5'
            ),
        }
        await saveReport(data, columnsOrder, period)

        expect(createCsvSpy).toHaveBeenCalledWith([
            [...columnsOrder.map((column) => ChannelsTableLabels[column])],
            [channelA.slug, '5', '5%', '5', '5s', '5s', '5s', '-', '5', '5'],
            [
                channelB.slug,
                ...Array(Object.keys(columnsOrder).length - 1).fill(
                    NOT_AVAILABLE_PLACEHOLDER
                ),
            ],
        ])
    })
})
