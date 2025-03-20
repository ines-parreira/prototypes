import { channels } from 'fixtures/channels'
import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import { Channel } from 'models/channel/types'
import { HandleTimeMeasure } from 'models/reporting/cubes/agentxp/HandleTimeCube'
import { HelpdeskCustomerMessagesReceivedEnrichedMeasure } from 'models/reporting/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import { HelpdeskMessageMeasure } from 'models/reporting/cubes/HelpdeskMessageCube'
import { TicketMeasure } from 'models/reporting/cubes/TicketCube'
import { TicketMessagesMeasure } from 'models/reporting/cubes/TicketMessagesCube'
import { TicketSatisfactionSurveyMeasure } from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { CHANNEL_DIMENSION } from 'models/reporting/queryFactories/support-performance/constants'
import {
    ChannelsTableLabels,
    columnsOrder,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {
    ChannelsReportMetrics,
    saveReport,
} from 'services/reporting/channelsReportingService'
import * as files from 'utils/file'

jest.mock('utils/file')

describe('channelsReportingService', () => {
    const channelA = channels[0]
    const channelB = channels[1]
    const reportChannels: Channel[] = [channelA, channelB]
    const fileName = 'someFileName'

    it('should format data', () => {
        const createCsvSpy = jest
            .spyOn(files, 'createCsv')
            .mockReturnValue('fakeReport1')
        const exampleData = (
            channel: string,
            metricField: ChannelsReportMetrics,
            value: string,
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
                '5',
            ),
            percentageOfCreatedTicketsMetricPerChannel: exampleData(
                channelA.slug,
                TicketMeasure.TicketCount,
                '5',
            ),
            closedTicketsMetricPerChannel: exampleData(
                channelA.slug,
                TicketMeasure.TicketCount,
                '5',
            ),
            ticketAverageHandleTimePerChannel: exampleData(
                channelA.slug,
                HandleTimeMeasure.AverageHandleTime,
                '5',
            ),
            medianFirstResponseTimeMetricPerChannel: exampleData(
                channelA.slug,
                TicketMessagesMeasure.MedianFirstResponseTime,
                '5',
            ),
            medianResponseTimeMetricPerChannel: exampleData(
                channelA.slug,
                TicketMessagesMeasure.MedianFirstResponseTime,
                '5',
            ),
            medianResolutionTimeMetricPerChannel: exampleData(
                channelA.slug,
                TicketMessagesMeasure.MedianResolutionTime,
                '5',
            ),
            ticketsRepliedMetricPerChannel: exampleData(
                channelA.slug,
                TicketMeasure.TicketCount,
                '5',
            ),
            messagesSentMetricPerChannel: exampleData(
                channelA.slug,
                HelpdeskMessageMeasure.MessageCount,
                '5',
            ),
            messagesReceivedMetricPerChannel: exampleData(
                channelA.slug,
                HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount,
                '5',
            ),
            customerSatisfactionMetricPerChannel: exampleData(
                channelA.slug,
                TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                '5',
            ),
        }
        saveReport(reportChannels, data, columnsOrder, fileName)

        expect(createCsvSpy).toHaveBeenCalledWith([
            [...columnsOrder.map((column) => ChannelsTableLabels[column])],
            [channelA.slug, '5', '5%', '5', '5s', '5s', '5s', '-', '5', '5'],
        ])
    })

    it('should return empty when no data', () => {
        const result = saveReport(reportChannels, null, columnsOrder, fileName)

        expect(result).toEqual({ files: {} })
    })
})
