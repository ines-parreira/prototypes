import {renderHook} from '@testing-library/react-hooks'

import {fromJS} from 'immutable'

import React from 'react'

import {Provider} from 'react-redux'

import {agents} from 'fixtures/agents'
import {useTableReportData} from 'hooks/reporting/common/useTableReportData'
import {
    AGENTS_REPORT_FILE_NAME,
    fetchAgentsTableReportData,
    useDownloadAgentsPerformanceData,
} from 'hooks/reporting/support-performance/agents/useDownloadAgentsPerformanceData'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import {OrderDirection} from 'models/api/types'
import {ReportingGranularity} from 'models/reporting/types'
import {BusiestTimeOfDaysMetrics} from 'pages/stats/support-performance/busiest-times-of-days/types'

import {createAgentsReport} from 'services/reporting/agentsPerformanceReportingService'
import {RootState} from 'state/types'
import {
    getSortedAgents,
    initialState as agentPerformanceInitialState,
} from 'state/ui/stats/agentPerformanceSlice'
import {AGENT_PERFORMANCE_SLICE_NAME} from 'state/ui/stats/constants'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import {AgentsTableColumn} from 'state/ui/stats/types'
import {assumeMock, mockStore} from 'utils/testing'

jest.mock('hooks/reporting/common/useTableReportData')
const useTableReportDataMock = assumeMock(useTableReportData)

jest.mock('hooks/reporting/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)
jest.mock('services/reporting/agentsPerformanceReportingService')
const saveReportMock = assumeMock(createAgentsReport)

describe('useDownloadAgentsPerformanceData', () => {
    const period = {
        start_datetime: '2021-02-03T00:00:00.000Z',
        end_datetime: '2021-02-03T23:59:59.999Z',
    }
    const state = {
        agents: fromJS({
            all: agents,
        }),
        stats: {
            filters: {period},
        },
        ui: {
            stats: {
                filters: uiStatsInitialState,
                statsTables: {
                    [AGENT_PERFORMANCE_SLICE_NAME]:
                        agentPerformanceInitialState,
                },
            },
        },
    } as RootState
    const columnsOrder = Object.values(AgentsTableColumn)
    const metricReturnValue = {
        isFetching: false,
        isError: false,
        data: {allData: [], value: null, decile: 0},
    }
    const summaryMetricReturnValue = {
        ...metricReturnValue,
        data: {
            value: 5,
        },
    }
    const agentsMetricsReturnValue = {
        reportData: {
            customerSatisfactionMetric: metricReturnValue,
            closedTicketsMetric: metricReturnValue,
            medianFirstResponseTimeMetric: metricReturnValue,
            messagesSentMetric: metricReturnValue,
            percentageOfClosedTicketsMetric: metricReturnValue,
            medianResolutionTimeMetric: metricReturnValue,
            ticketsRepliedMetric: metricReturnValue,
            oneTouchTicketsMetric: metricReturnValue,
            repliedTicketsPerHourMetric: metricReturnValue,
            onlineTimeMetric: metricReturnValue,
            messagesSentPerHourMetric: metricReturnValue,
            closedTicketsPerHourMetric: metricReturnValue,
            ticketHandleTimeMetric: metricReturnValue,
        },
        isLoading: false,
        period,
    }

    const agentsSummaryMetricsReturnValue = {
        summaryData: {
            customerSatisfactionMetric: summaryMetricReturnValue,
            closedTicketsMetric: summaryMetricReturnValue,
            medianFirstResponseTimeMetric: summaryMetricReturnValue,
            messagesSentMetric: summaryMetricReturnValue,
            percentageOfClosedTicketsMetric: summaryMetricReturnValue,
            medianResolutionTimeMetric: summaryMetricReturnValue,
            ticketsRepliedMetric: summaryMetricReturnValue,
            oneTouchTicketsMetric: {
                ...summaryMetricReturnValue,
                data: {...summaryMetricReturnValue.data, prevValue: 0},
            },
            repliedTicketsPerHourMetric: summaryMetricReturnValue,
            onlineTimeMetric: summaryMetricReturnValue,
            messagesSentPerHourMetric: summaryMetricReturnValue,
            closedTicketsPerHourMetric: summaryMetricReturnValue,
            ticketHandleTimeMetric: summaryMetricReturnValue,
        },
        isLoading: false,
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
    }

    beforeEach(() => {
        useTableReportDataMock.mockReturnValueOnce({
            data: agentsMetricsReturnValue.reportData,
            isFetching: false,
        })
        useTableReportDataMock.mockReturnValueOnce({
            data: agentsSummaryMetricsReturnValue.summaryData,
            isFetching: false,
        })
        useAgentsTableConfigSettingMock.mockReturnValue({
            columnsOrder: columnsOrder,
        } as any)
    })

    it('Should return report files, file name and the loading state', () => {
        const fileName = getCsvFileNameWithDates(
            period,
            AGENTS_REPORT_FILE_NAME
        )
        const report = {
            files: {['file']: 'data'},
        }
        useTableReportDataMock.mockReturnValueOnce({
            data: agentsMetricsReturnValue.reportData,
            isFetching: true,
        })
        useTableReportDataMock.mockReturnValueOnce({
            data: agentsSummaryMetricsReturnValue.summaryData,
            isFetching: true,
        })
        saveReportMock.mockReturnValue(report)

        const {result} = renderHook(() => useDownloadAgentsPerformanceData(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(saveReportMock).toHaveBeenCalledWith(
            getSortedAgents(state),
            agentsMetricsReturnValue.reportData,
            agentsSummaryMetricsReturnValue.summaryData,
            columnsOrder,
            fileName
        )
        expect(result.current).toEqual({
            ...report,
            fileName,
            isLoading: false,
        })
    })

    it('Should return loading state', () => {
        const fileName = getCsvFileNameWithDates(
            period,
            AGENTS_REPORT_FILE_NAME
        )
        const report = {
            files: {['file']: 'data'},
            fileName: getCsvFileNameWithDates(period, AGENTS_REPORT_FILE_NAME),
        }

        saveReportMock.mockReturnValue(report)

        const {result} = renderHook(() => useDownloadAgentsPerformanceData(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(saveReportMock).toHaveBeenCalledWith(
            getSortedAgents(state),
            agentsMetricsReturnValue.reportData,
            agentsSummaryMetricsReturnValue.summaryData,
            columnsOrder,
            fileName
        )
        expect(result.current).toEqual({
            ...report,
            isLoading: true,
        })
    })

    describe('fetchAgentsTableReportData', () => {
        const filters = {period}
        const userTimezone = 'UTC'
        const granularity = ReportingGranularity.Day
        const context = {
            agents: [],
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
        }

        it('Should return report file name', async () => {
            const response = await fetchAgentsTableReportData(
                filters,
                userTimezone,
                granularity,
                context
            )
            const fileName = getCsvFileNameWithDates(
                filters.period,
                AGENTS_REPORT_FILE_NAME
            )

            expect(response).toEqual({
                isLoading: false,
                files: {},
                fileName,
            })
        })
    })
})
