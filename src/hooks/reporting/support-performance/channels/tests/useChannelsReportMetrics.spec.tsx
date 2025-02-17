import {renderHook} from '@testing-library/react-hooks'

import {mockFlags} from 'jest-launchdarkly-mock'

import moment from 'moment'

import React from 'react'
import {Provider} from 'react-redux'

import {FeatureFlagKey} from 'config/featureFlags'
import {channels} from 'fixtures/channels'
import {
    fetchTableReportData,
    useTableReportData,
} from 'hooks/reporting/common/useTableReportData'
import {
    CHANNELS_REPORT_FILE_NAME,
    fetchChannelsTableReportData,
    useChannelsReportMetrics,
} from 'hooks/reporting/support-performance/channels/useChannelsReportMetrics'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {useSortedChannels} from 'hooks/reporting/support-performance/useSortedChannels'
import {OrderDirection} from 'models/api/types'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {ReportingGranularity} from 'models/reporting/types'
import {TagFilterInstanceId} from 'models/stat/types'
import {BusiestTimeOfDaysMetrics} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {columnsOrder} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {saveReport} from 'services/reporting/channelsReportingService'
import {RootState} from 'state/types'
import {agentPerformanceSlice} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import {assumeMock, mockStore} from 'utils/testing'

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
                statsTables: {
                    [agentPerformanceSlice.name]:
                        agentPerformanceSlice.getInitialState(),
                },
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
        medianResolutionTimeMetricPerChannel: metricData,
        ticketsRepliedMetricPerChannel: metricData,
        messagesSentMetricPerChannel: metricData,
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
        mockFlags({[FeatureFlagKey.AnalyticsNewFilters]: false})
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

        expect(useTableReportDataMock).toHaveBeenCalledWith(
            expect.objectContaining({
                tags: mockedTags,
                channels: mockedChannels,
            }),
            expect.anything(),
            expect.anything()
        )
    })

    it('should call one of hooks with stats filters with default logical operator', () => {
        mockFlags({[FeatureFlagKey.AnalyticsNewFilters]: true})

        renderHook(() => useChannelsReportMetrics(), {
            wrapper: ({children}) => (
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
            expect.anything()
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
                agents: [],
                agentsQA: [],
                columnsOrder: [],
                channels: [],
                channelColumnsOrder: [],
                selectedBTODMetric: BusiestTimeOfDaysMetrics.TicketsCreated,
                customFieldsOrder: {
                    direction: OrderDirection.Asc,
                    column: 1,
                },
                selectedCustomFieldId: null,
                tags: {},
                tagsTableOrder: {
                    direction: OrderDirection.Asc,
                    column: 1,
                },
                integrations: [],
                getAgentDetails: () => undefined,
            }
            const fileName = getCsvFileNameWithDates(
                statsFilters.period,
                CHANNELS_REPORT_FILE_NAME
            )

            const result = await fetchChannelsTableReportData(
                statsFilters,
                userTimezone,
                granularity,
                context
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
                agents: [],
                agentsQA: [],
                columnsOrder: [],
                channels: [],
                channelColumnsOrder: [],
                selectedBTODMetric: BusiestTimeOfDaysMetrics.TicketsCreated,
                customFieldsOrder: {
                    direction: OrderDirection.Asc,
                    column: 1,
                },
                selectedCustomFieldId: null,
                tags: {},
                tagsTableOrder: {
                    direction: OrderDirection.Asc,
                    column: 1,
                },
                integrations: [],
                getAgentDetails: () => undefined,
            }
            const fileName = getCsvFileNameWithDates(
                statsFilters.period,
                CHANNELS_REPORT_FILE_NAME
            )

            const result = await fetchChannelsTableReportData(
                statsFilters,
                userTimezone,
                granularity,
                context
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
