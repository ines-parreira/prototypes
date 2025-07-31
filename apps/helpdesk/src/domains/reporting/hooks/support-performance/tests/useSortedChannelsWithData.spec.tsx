import { renderHook } from '@repo/testing'

import { useChannelsReportMetrics } from 'domains/reporting/hooks/support-performance/channels/useChannelsReportMetrics'
import { useSortedChannelsWithData } from 'domains/reporting/hooks/support-performance/useSortedChannelsWithData'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import { channels as mockChannels } from 'fixtures/channels'
import { assumeMock } from 'utils/testing'

jest.mock(
    'domains/reporting/hooks/support-performance/channels/useChannelsReportMetrics',
)
const useChannelsReportMetricsMock = assumeMock(useChannelsReportMetrics)

describe('useSortedChannelsWithData', () => {
    const nullReportData = {
        createdTicketsMetricPerChannel: {
            data: null,
        },
        percentageOfCreatedTicketsMetricPerChannel: {
            data: null,
        },
        closedTicketsMetricPerChannel: {
            data: null,
        },
        ticketAverageHandleTimePerChannel: {
            data: null,
        },
        medianFirstResponseTimeMetricPerChannel: {
            data: null,
        },
        medianResolutionTimeMetricPerChannel: {
            data: null,
        },
        ticketsRepliedMetricPerChannel: {
            data: null,
        },
        messagesSentMetricPerChannel: {
            data: null,
        },
        customerSatisfactionMetricPerChannel: {
            data: null,
        },
    }
    beforeEach(() => {
        useChannelsReportMetricsMock.mockReturnValue({
            reportData: nullReportData,
            isLoading: false,
        } as any)
    })

    it('should return all channels while loading data', () => {
        useChannelsReportMetricsMock.mockReturnValue({
            channels: mockChannels,
            reportData: nullReportData,
            isLoading: true,
        } as any)

        const { result } = renderHook(() => useSortedChannelsWithData())

        expect(result.current).toEqual({
            channels: mockChannels,
            isLoading: true,
        })
    })

    it('should hides channels without data', () => {
        useChannelsReportMetricsMock.mockReturnValue({
            channels: mockChannels,
            reportData: nullReportData,
            isLoading: false,
        } as any)

        const { result } = renderHook(() => useSortedChannelsWithData())

        expect(result.current).toEqual({
            channels: [],
            isLoading: false,
        })
    })

    it('should return channels with at least some data', () => {
        const emailChannel = 'email'
        const airflowChannel = 'airflow'
        useChannelsReportMetricsMock.mockReturnValue({
            channels: mockChannels,
            reportData: {
                ...nullReportData,
                createdTicketsMetricPerChannel: {
                    data: {
                        allData: [{ [CHANNEL_DIMENSION]: emailChannel }],
                    },
                },
                percentageOfCreatedTicketsMetricPerChannel: {
                    data: {
                        allData: [{ [CHANNEL_DIMENSION]: airflowChannel }],
                    },
                },
            },
            isLoading: false,
        } as any)

        const { result } = renderHook(() => useSortedChannelsWithData())

        expect(result.current).toEqual({
            channels: mockChannels.filter((channel) =>
                [emailChannel, airflowChannel].includes(channel.slug),
            ),
            isLoading: false,
        })
    })
})
