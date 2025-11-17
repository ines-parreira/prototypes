import type { MetricWithDecile } from 'domains/reporting/hooks/useMetricPerDimension'
import { HandleTimeMeasure } from 'domains/reporting/models/cubes/agentxp/HandleTimeCube'
import { HelpdeskCustomerMessagesReceivedEnrichedMeasure } from 'domains/reporting/models/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import { HelpdeskMessageMeasure } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketMeasure } from 'domains/reporting/models/cubes/TicketCube'
import { TicketFirstHumanAgentResponseTimeMeasure } from 'domains/reporting/models/cubes/TicketFirstHumanAgentResponseTime'
import { TicketMessagesMeasure } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { TicketMessagesEnrichedResponseTimesMeasure } from 'domains/reporting/models/cubes/TicketMessagesEnrichedResponseTimesCube'
import { TicketSatisfactionSurveyMeasure } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { TicketsFirstAgentResponseTimeMeasure } from 'domains/reporting/models/cubes/TicketsFirstAgentResponseTimeCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import {
    ChannelsTableLabels,
    columnsOrder,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import type { ChannelsReportMetrics } from 'domains/reporting/services/channelsReportingService'
import { saveReport } from 'domains/reporting/services/channelsReportingService'
import { channels } from 'fixtures/channels'
import type { Channel } from 'models/channel/types'
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
                '1',
            ),
            humanTimeAfterAiHandoffMetricPerChannel: exampleData(
                channelA.slug,
                TicketFirstHumanAgentResponseTimeMeasure.MedianFirstHumanAgentResponseTime,
                '69',
            ),
            percentageOfCreatedTicketsMetricPerChannel: exampleData(
                channelA.slug,
                TicketMeasure.TicketCount,
                '2',
            ),
            closedTicketsMetricPerChannel: exampleData(
                channelA.slug,
                TicketMeasure.TicketCount,
                '3',
            ),
            ticketAverageHandleTimePerChannel: exampleData(
                channelA.slug,
                HandleTimeMeasure.AverageHandleTime,
                '4',
            ),
            medianFirstResponseTimeMetricPerChannel: exampleData(
                channelA.slug,
                TicketMessagesMeasure.MedianFirstResponseTime,
                '5',
            ),
            medianResponseTimeMetricPerChannel: exampleData(
                channelA.slug,
                TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                '6',
            ),
            medianResolutionTimeMetricPerChannel: exampleData(
                channelA.slug,
                TicketMessagesMeasure.MedianResolutionTime,
                '7',
            ),
            ticketsRepliedMetricPerChannel: exampleData(
                channelA.slug,
                HelpdeskMessageMeasure.TicketCount,
                '8',
            ),
            messagesSentMetricPerChannel: exampleData(
                channelA.slug,
                HelpdeskMessageMeasure.MessageCount,
                '9',
            ),
            messagesReceivedMetricPerChannel: exampleData(
                channelA.slug,
                HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount,
                '10',
            ),
            customerSatisfactionMetricPerChannel: exampleData(
                channelA.slug,
                TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                '11',
            ),
        }

        saveReport(reportChannels, data, columnsOrder, true, fileName)

        expect(createCsvSpy).toHaveBeenCalledWith([
            [...columnsOrder.map((column) => ChannelsTableLabels[column])],
            [
                channelA.slug,
                '1',
                '1m 09s',
                '2%',
                '3',
                '4s',
                '5s',
                '6s',
                '7s',
                '8',
                '9',
                '11',
                '10',
            ],
        ])
    })

    it('should return empty when no data', () => {
        const result = saveReport(
            reportChannels,
            null,
            columnsOrder,
            true,
            fileName,
        )

        expect(result).toEqual({ files: {} })
    })

    it('should use MedianFirstResponseTime when shouldIncludeBots is true', () => {
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
                '1',
            ),
            humanTimeAfterAiHandoffMetricPerChannel: exampleData(
                channelA.slug,
                TicketFirstHumanAgentResponseTimeMeasure.MedianFirstHumanAgentResponseTime,
                '69',
            ),
            percentageOfCreatedTicketsMetricPerChannel: exampleData(
                channelA.slug,
                TicketMeasure.TicketCount,
                '2',
            ),
            closedTicketsMetricPerChannel: exampleData(
                channelA.slug,
                TicketMeasure.TicketCount,
                '3',
            ),
            ticketAverageHandleTimePerChannel: exampleData(
                channelA.slug,
                HandleTimeMeasure.AverageHandleTime,
                '4',
            ),
            medianFirstResponseTimeMetricPerChannel: exampleData(
                channelA.slug,
                TicketMessagesMeasure.MedianFirstResponseTime,
                '5',
            ),
            medianResponseTimeMetricPerChannel: exampleData(
                channelA.slug,
                TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                '6',
            ),
            medianResolutionTimeMetricPerChannel: exampleData(
                channelA.slug,
                TicketMessagesMeasure.MedianResolutionTime,
                '7',
            ),
            ticketsRepliedMetricPerChannel: exampleData(
                channelA.slug,
                HelpdeskMessageMeasure.TicketCount,
                '8',
            ),
            messagesSentMetricPerChannel: exampleData(
                channelA.slug,
                HelpdeskMessageMeasure.MessageCount,
                '9',
            ),
            messagesReceivedMetricPerChannel: exampleData(
                channelA.slug,
                HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount,
                '10',
            ),
            customerSatisfactionMetricPerChannel: exampleData(
                channelA.slug,
                TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                '11',
            ),
        }

        saveReport(reportChannels, data, columnsOrder, true, fileName)

        expect(createCsvSpy).toHaveBeenCalledWith([
            [...columnsOrder.map((column) => ChannelsTableLabels[column])],
            [
                channelA.slug,
                '1',
                '1m 09s',
                '2%',
                '3',
                '4s',
                '5s',
                '6s',
                '7s',
                '8',
                '9',
                '11',
                '10',
            ],
        ])
    })

    it('should use MedianFirstAgentResponseTime when shouldIncludeBots is false', () => {
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
                '1',
            ),
            humanTimeAfterAiHandoffMetricPerChannel: exampleData(
                channelA.slug,
                TicketFirstHumanAgentResponseTimeMeasure.MedianFirstHumanAgentResponseTime,
                '69',
            ),
            percentageOfCreatedTicketsMetricPerChannel: exampleData(
                channelA.slug,
                TicketMeasure.TicketCount,
                '2',
            ),
            closedTicketsMetricPerChannel: exampleData(
                channelA.slug,
                TicketMeasure.TicketCount,
                '3',
            ),
            ticketAverageHandleTimePerChannel: exampleData(
                channelA.slug,
                HandleTimeMeasure.AverageHandleTime,
                '4',
            ),
            medianFirstResponseTimeMetricPerChannel: exampleData(
                channelA.slug,
                TicketsFirstAgentResponseTimeMeasure.MedianFirstAgentResponseTime,
                '5',
            ),
            medianResponseTimeMetricPerChannel: exampleData(
                channelA.slug,
                TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                '6',
            ),
            medianResolutionTimeMetricPerChannel: exampleData(
                channelA.slug,
                TicketMessagesMeasure.MedianResolutionTime,
                '7',
            ),
            ticketsRepliedMetricPerChannel: exampleData(
                channelA.slug,
                HelpdeskMessageMeasure.TicketCount,
                '8',
            ),
            messagesSentMetricPerChannel: exampleData(
                channelA.slug,
                HelpdeskMessageMeasure.MessageCount,
                '9',
            ),
            messagesReceivedMetricPerChannel: exampleData(
                channelA.slug,
                HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount,
                '10',
            ),
            customerSatisfactionMetricPerChannel: exampleData(
                channelA.slug,
                TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                '11',
            ),
        }

        saveReport(reportChannels, data, columnsOrder, false, fileName)

        expect(createCsvSpy).toHaveBeenCalledWith([
            [...columnsOrder.map((column) => ChannelsTableLabels[column])],
            [
                channelA.slug,
                '1',
                '1m 09s',
                '2%',
                '3',
                '4s',
                '5s',
                '6s',
                '7s',
                '8',
                '9',
                '11',
                '10',
            ],
        ])
    })
})
