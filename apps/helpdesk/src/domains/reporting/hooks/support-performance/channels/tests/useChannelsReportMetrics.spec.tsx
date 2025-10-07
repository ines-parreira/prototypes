import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'
import { Provider } from 'react-redux'

import {
    fetchTableReportData,
    useTableReportData,
} from 'domains/reporting/hooks/common/useTableReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import {
    CHANNELS_REPORT_FILE_NAME,
    fetchChannelsTableReportData,
    useChannelsReportMetrics,
} from 'domains/reporting/hooks/support-performance/channels/useChannelsReportMetrics'
import { useSortedChannels } from 'domains/reporting/hooks/support-performance/useSortedChannels'
import { useIsHrtAiEnabled } from 'domains/reporting/hooks/useIsHrtAiEnabled'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { columnsOrder } from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import { saveReport } from 'domains/reporting/services/channelsReportingService'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { channels } from 'fixtures/channels'
import { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

jest.mock('domains/reporting/hooks/support-performance/useSortedChannels')

jest.mock('domains/reporting/hooks/common/useTableReportData')
const useTableReportDataMock = assumeMock(useTableReportData)
const useSortedChannelsMock = assumeMock(useSortedChannels)
const fetchTableReportDataMock = assumeMock(fetchTableReportData)

jest.mock('domains/reporting/hooks/useIsHrtAiEnabled')
const useIsHrtAiEnabledMock = assumeMock(useIsHrtAiEnabled)

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
        humanTimeAfterAiHandoffMetricPerChannel: metricData,
    }

    const expectedMetrics: ReturnType<typeof useChannelsReportMetrics> = {
        channels,
        files: saveReport(channels, reportData, columnsOrder, true, fileName)
            .files,
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
        useIsHrtAiEnabledMock.mockReturnValue(true)
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
                shouldIncludeBots: true,
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
                shouldIncludeBots: true,
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
