import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'
import React from 'react'
import {Provider} from 'react-redux'
import {mockFlags} from 'jest-launchdarkly-mock'
import {channels} from 'fixtures/channels'
import {useSortedChannels} from 'hooks/reporting/support-performance/useSortedChannels'
import {useChannelsReportMetrics} from 'hooks/reporting/useChannelsReportMetrics'
import {agentPerformanceSlice} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock, mockStore} from 'utils/testing'
import {
    useClosedTicketsMetricPerChannel,
    useCreatedTicketsMetricPerChannel,
    useCustomerSatisfactionMetricPerChannel,
    useMedianFirstResponseTimeMetricPerChannel,
    useMedianResolutionTimeMetricPerChannel,
    useMessagesSentMetricPerChannel,
    useTicketAverageHandleTimePerChannel,
    useTicketsRepliedMetricPerChannel,
} from 'hooks/reporting/metricsPerChannel'
import {usePercentageOfCreatedTicketsMetricPerChannel} from 'hooks/reporting/usePercentageOfCreatedTicketsMetricPerChannel'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {FeatureFlagKey} from 'config/featureFlags'

jest.mock('hooks/reporting/support-performance/useSortedChannels')

jest.mock('hooks/reporting/metricsPerChannel')
jest.mock('hooks/reporting/usePercentageOfCreatedTicketsMetricPerChannel')
const useClosedTicketsMetricPerChannelMock = assumeMock(
    useClosedTicketsMetricPerChannel
)
const useCreatedTicketsMetricPerChannelMock = assumeMock(
    useCreatedTicketsMetricPerChannel
)
const useCustomerSatisfactionMetricPerChannelMock = assumeMock(
    useCustomerSatisfactionMetricPerChannel
)
const useMedianFirstResponseTimeMetricPerChannelMock = assumeMock(
    useMedianFirstResponseTimeMetricPerChannel
)
const useMedianResolutionTimeMetricPerChannelMock = assumeMock(
    useMedianResolutionTimeMetricPerChannel
)
const useMessagesSentMetricPerChannelMock = assumeMock(
    useMessagesSentMetricPerChannel
)
const useTicketAverageHandleTimePerChannelMock = assumeMock(
    useTicketAverageHandleTimePerChannel
)
const useTicketsRepliedMetricPerChannelMock = assumeMock(
    useTicketsRepliedMetricPerChannel
)
const usePercentageOfCreatedTicketsMetricPerChannelMock = assumeMock(
    usePercentageOfCreatedTicketsMetricPerChannel
)

const useSortedChannelsMock = assumeMock(useSortedChannels)

describe('useChannelsReportMetrics', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const period = {
        end_datetime: periodEnd.toISOString(),
        start_datetime: periodStart.toISOString(),
    }
    const mockedTags = ['a', 'b']
    const mockedChannels = [1, 2, 3]
    const state = {
        stats: {
            filters: {
                period,
                channels: withDefaultLogicalOperator(mockedChannels),
                tags: withDefaultLogicalOperator(mockedTags),
            },
        },
        ui: {
            stats: uiStatsInitialState,
            [agentPerformanceSlice.name]:
                agentPerformanceSlice.getInitialState(),
        },
    } as any

    const metricData = {
        isFetching: false,
        isError: false,
        data: {
            value: 2,
            decile: 0,
            allData: [],
        },
    }
    const expectedMetrics: ReturnType<typeof useChannelsReportMetrics> = {
        reportData: {
            channels: channels,
            createdTicketsMetricPerChannel: metricData,
            percentageOfCreatedTicketsMetricPerChannel: metricData,
            closedTicketsMetricPerChannel: metricData,
            ticketAverageHandleTimePerChannel: metricData,
            medianFirstResponseTimeMetricPerChannel: metricData,
            medianResolutionTimeMetricPerChannel: metricData,
            ticketsRepliedMetricPerChannel: metricData,
            messagesSentMetricPerChannel: metricData,
            customerSatisfactionMetricPerChannel: metricData,
        },
        isLoading: false,
        period,
    }

    beforeEach(() => {
        mockFlags({[FeatureFlagKey.AnalyticsNewFilters]: false})

        useSortedChannelsMock.mockReturnValue({
            sortedChannels: channels,
            isLoading: false,
        })
        useClosedTicketsMetricPerChannelMock.mockReturnValue(metricData)
        useCreatedTicketsMetricPerChannelMock.mockReturnValue(metricData)
        useCustomerSatisfactionMetricPerChannelMock.mockReturnValue(metricData)
        useMedianFirstResponseTimeMetricPerChannelMock.mockReturnValue(
            metricData
        )
        useMedianResolutionTimeMetricPerChannelMock.mockReturnValue(metricData)
        useMessagesSentMetricPerChannelMock.mockReturnValue(metricData)
        useTicketAverageHandleTimePerChannelMock.mockReturnValue(metricData)
        useTicketsRepliedMetricPerChannelMock.mockReturnValue(metricData)
        usePercentageOfCreatedTicketsMetricPerChannelMock.mockReturnValue(
            metricData
        )
    })

    it('should return channels metrics', () => {
        const {result} = renderHook(() => useChannelsReportMetrics(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}> {children} </Provider>
            ),
        })

        expect(result.current).toEqual(expectedMetrics)
    })

    it('should call one of hooks with the legacy stats filters', () => {
        renderHook(() => useChannelsReportMetrics(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}> {children} </Provider>
            ),
        })

        expect(useClosedTicketsMetricPerChannelMock.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                tags: mockedTags,
                channels: mockedChannels,
            })
        )
    })

    it('should call one of hooks with stats filters with default logical operator', () => {
        mockFlags({[FeatureFlagKey.AnalyticsNewFilters]: true})

        renderHook(() => useChannelsReportMetrics(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}> {children} </Provider>
            ),
        })

        expect(useClosedTicketsMetricPerChannelMock.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                tags: withDefaultLogicalOperator(mockedTags),
                channels: withDefaultLogicalOperator(mockedChannels),
            })
        )
    })
})
