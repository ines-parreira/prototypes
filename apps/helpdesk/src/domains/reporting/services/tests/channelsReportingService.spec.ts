import * as files from '@repo/utils'

import type { MetricWithDecile } from 'domains/reporting/hooks/types'
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
import {
    getChannelMetric,
    saveReport,
} from 'domains/reporting/services/channelsReportingService'
import { channels } from 'fixtures/channels'
import type { Channel } from 'models/channel/types'

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    saveZippedFiles: jest.fn(),
    saveFileAsDownloaded: jest.fn(),
    saveBlobAsDownloaded: jest.fn(),
    createCsv: jest.fn(),
    getText: jest.fn(),
    getBase64: jest.fn(),
    getFileTooLargeError: jest.fn(),
}))

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
                dimensions: [CHANNEL_DIMENSION],
                measures: [metricField] as any,
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

        saveReport(reportChannels, data, columnsOrder, fileName)

        expect(createCsvSpy).toHaveBeenCalledWith([
            columnsOrder.map((column) => ChannelsTableLabels[column]),
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
        const result = saveReport(reportChannels, null, columnsOrder, fileName)

        expect(result).toEqual({ files: {} })
    })

    it('should use MedianFirstAgentResponseTime', () => {
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
                dimensions: [CHANNEL_DIMENSION],
                measures: [metricField] as any,
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

        saveReport(reportChannels, data, columnsOrder, fileName)

        expect(createCsvSpy).toHaveBeenCalledWith([
            columnsOrder.map((column) => ChannelsTableLabels[column]),
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

describe('getChannelMetric', () => {
    const channelSlug = 'test-channel'
    const metricField = TicketMeasure.TicketCount

    it('should return null when data.data is null', () => {
        const result = getChannelMetric(channelSlug, { data: null })

        expect(result).toBeNull()
    })

    it('should return undefined when allData is empty', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [],
                dimensions: [CHANNEL_DIMENSION],
                measures: [metricField] as any,
            },
        })

        expect(result).toBeUndefined()
    })

    it('should return undefined when no matching channel in allData', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: 'other-channel',
                        [metricField]: 100,
                    },
                ],
                dimensions: [CHANNEL_DIMENSION],
                measures: [metricField] as any,
            },
        })

        expect(result).toBeUndefined()
    })

    it('should return the correct number value when channel matches', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: channelSlug,
                        [metricField]: 42,
                    },
                ],
                dimensions: [CHANNEL_DIMENSION],
                measures: [metricField] as any,
            },
        })

        expect(result).toBe(42)
    })

    it('should convert string values to numbers', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: channelSlug,
                        [metricField]: '123',
                    },
                ],
                dimensions: [CHANNEL_DIMENSION],
                measures: [metricField] as any,
            },
        })

        expect(result).toBe(123)
    })

    it('should return undefined when metricField does not exist on found item', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: channelSlug,
                    },
                ],
                dimensions: [CHANNEL_DIMENSION],
                measures: [metricField] as any,
            },
        })

        expect(result).toBeUndefined()
    })

    it('should find the correct item when multiple items exist in allData', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: 'other-channel-1',
                        [metricField]: 10,
                    },
                    {
                        [CHANNEL_DIMENSION]: channelSlug,
                        [metricField]: 99,
                    },
                    {
                        [CHANNEL_DIMENSION]: 'other-channel-2',
                        [metricField]: 20,
                    },
                ],
                dimensions: [CHANNEL_DIMENSION],
                measures: [metricField] as any,
            },
        })

        expect(result).toBe(99)
    })

    it('should handle zero as a valid value', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: channelSlug,
                        [metricField]: 0,
                    },
                ],
                dimensions: [CHANNEL_DIMENSION],
                measures: [metricField] as any,
            },
        })

        expect(result).toBe(0)
    })

    it('should handle string zero and convert to number', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: channelSlug,
                        [metricField]: '0',
                    },
                ],
                dimensions: [CHANNEL_DIMENSION],
                measures: [metricField] as any,
            },
        })

        expect(result).toBe(0)
    })

    it('should handle negative numbers', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: channelSlug,
                        [metricField]: -5,
                    },
                ],
                dimensions: [CHANNEL_DIMENSION],
                measures: [metricField] as any,
            },
        })

        expect(result).toBe(-5)
    })

    it('should handle decimal numbers', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: channelSlug,
                        [metricField]: 3.14,
                    },
                ],
                dimensions: [CHANNEL_DIMENSION],
                measures: [metricField] as any,
            },
        })

        expect(result).toBe(3.14)
    })

    it('should convert decimal string to number', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: channelSlug,
                        [metricField]: '3.14',
                    },
                ],
                dimensions: [CHANNEL_DIMENSION],
                measures: [metricField] as any,
            },
        })

        expect(result).toBe(3.14)
    })

    it('should return undefined when dimensions array is empty', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: channelSlug,
                        [metricField]: 42,
                    },
                ],
                dimensions: [],
                measures: [metricField] as any,
            },
        })

        expect(result).toBeUndefined()
    })

    it('should return undefined when measures array is empty', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: channelSlug,
                        [metricField]: 42,
                    },
                ],
                dimensions: [CHANNEL_DIMENSION],
                measures: [],
            },
        })

        expect(result).toBeUndefined()
    })

    it('should return undefined when dimensions is undefined', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: channelSlug,
                        [metricField]: 42,
                    },
                ],
                measures: [metricField] as any,
            },
        })

        expect(result).toBeUndefined()
    })

    it('should return undefined when measures is undefined', () => {
        const result = getChannelMetric(channelSlug, {
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [CHANNEL_DIMENSION]: channelSlug,
                        [metricField]: 42,
                    },
                ],
                dimensions: [CHANNEL_DIMENSION],
            },
        })

        expect(result).toBeUndefined()
    })
})
