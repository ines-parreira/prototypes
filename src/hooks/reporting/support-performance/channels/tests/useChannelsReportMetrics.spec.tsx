import React from 'react'

import moment from 'moment'
import { Provider } from 'react-redux'

import { channels } from 'fixtures/channels'
import {
    fetchTableReportData,
    useTableReportData,
} from 'hooks/reporting/common/useTableReportData'
import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import {
    CHANNELS_REPORT_FILE_NAME,
    fetchChannelsTableReportData,
    useChannelsReportMetrics,
} from 'hooks/reporting/support-performance/channels/useChannelsReportMetrics'
import { useSortedChannels } from 'hooks/reporting/support-performance/useSortedChannels'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { ReportingGranularity } from 'models/reporting/types'
import { TagFilterInstanceId } from 'models/stat/types'
import { columnsOrder } from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import { saveReport } from 'services/reporting/channelsReportingService'
import { RootState } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { assumeMock, mockStore } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/support-performance/useSortedChannels')

jest.mock('hooks/reporting/common/useTableReportData')
const useTableReportDataMock = assumeMock(useTableReportData)
const useSortedChannelsMock = assumeMock(useSortedChannels)
const fetchTableReportDataMock = assumeMock(fetchTableReportData)

describe('useChannelsReportMetrics', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const period = {
        end_datetime: periodEnd.toISOString(),
        start_datetime: periodStart.toISOString(),
    }
    const mockedTags = [1, 2]
    const mockedChannels = ['1', '2', '3']
    const statsFilters = {
        period,
        channels: withDefaultLogicalOperator(mockedChannels),
        tags: [
            {
                ...withDefaultLogicalOperator(mockedTags),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }
    const state = {
        stats: {
            filters: statsFilters,
        },
        ui: {
            stats: {
                filters: uiStatsInitialState,
            },
        },
    } as RootState
    const userTimezone = 'UTC'
    const granularity = ReportingGranularity.Day

    const metricData = {
        isFetching: false,
        isError: false,
        data: {
            value: 2,
            decile: 0,
            allData: [],
        },
    }
    const fileName = getCsvFileNameWithDates(period, CHANNELS_REPORT_FILE_NAME)
    const reportData = {
        createdTicketsMetricPerChannel: metricData,
        percentageOfCreatedTicketsMetricPerChannel: metricData,
        closedTicketsMetricPerChannel: metricData,
        ticketAverageHandleTimePerChannel: metricData,
        medianFirstResponseTimeMetricPerChannel: metricData,
        medianResponseTimeMetricPerChannel: metricData,
        medianResolutionTimeMetricPerChannel: metricData,
        ticketsRepliedMetricPerChannel: metricData,
        messagesSentMetricPerChannel: metricData,
        messagesReceivedMetricPerChannel: metricData,
        customerSatisfactionMetricPerChannel: metricData,
    }

    const expectedMetrics: ReturnType<typeof useChannelsReportMetrics> = {
        channels,
        files: saveReport(channels, reportData, columnsOrder, fileName).files,
        fileName,
        reportData,
        isLoading: false,
    }

    beforeEach(() => {
        useSortedChannelsMock.mockReturnValue({
            sortedChannels: channels,
            isLoading: false,
        })
        useTableReportDataMock.mockReturnValue({
            data: expectedMetrics.reportData,
            isFetching: false,
        })
    })

    it('should return channels metrics', () => {
        const { result } = renderHook(() => useChannelsReportMetrics(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}> {children} </Provider>
            ),
        })

        expect(result.current).toEqual(expectedMetrics)
    })

    it('should return channels metrics with MedianResponseTime', () => {
        const { result } = renderHook(() => useChannelsReportMetrics(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}> {children} </Provider>
            ),
        })

        expect(result.current.reportData).toEqual(
            expect.objectContaining({
                medianResponseTimeMetricPerChannel: metricData,
            }),
        )
    })

    it('should call one of hooks with stats filters with default logical operator', () => {
        renderHook(() => useChannelsReportMetrics(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}> {children} </Provider>
            ),
        })

        expect(useTableReportDataMock).toHaveBeenCalledWith(
            expect.objectContaining({
                tags: [
                    {
                        ...withDefaultLogicalOperator(mockedTags),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
                channels: withDefaultLogicalOperator(mockedChannels),
            }),
            expect.anything(),
            expect.anything(),
        )
    })

    describe('fetchChannelsTableReportData', () => {
        it('should return data', async () => {
            fetchTableReportDataMock.mockResolvedValue({
                isError: false,
                isFetching: false,
                data: {},
            })
            const context = {
                channels: [],
                channelColumnsOrder: [],
                isReportingAverageResponseTimeEnabled: false,
            }
            const fileName = getCsvFileNameWithDates(
                statsFilters.period,
                CHANNELS_REPORT_FILE_NAME,
            )

            const result = await fetchChannelsTableReportData(
                statsFilters,
                userTimezone,
                granularity,
                context,
            )

            expect(result).toEqual({
                fileName,
                files: {
                    [fileName]: '',
                },
                isLoading: false,
                isError: false,
            })
        })

        it('should return empty on error', async () => {
            fetchTableReportDataMock.mockRejectedValue({
                isError: false,
                isFetching: false,
                data: {},
            })
            const context = {
                channels: [],
                channelColumnsOrder: [],
                isReportingAverageResponseTimeEnabled: false,
            }
            const fileName = getCsvFileNameWithDates(
                statsFilters.period,
                CHANNELS_REPORT_FILE_NAME,
            )

            const result = await fetchChannelsTableReportData(
                statsFilters,
                userTimezone,
                granularity,
                context,
            )

            expect(result).toEqual({
                fileName,
                files: {},
                isLoading: false,
                isError: true,
            })
        })
    })
})
