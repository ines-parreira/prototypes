import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { useTableReportData } from 'domains/reporting/hooks/common/useTableReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import {
    AGENTS_REPORT_FILE_NAME,
    fetchAgentsTableReportData,
    useDownloadAgentsPerformanceData,
} from 'domains/reporting/hooks/support-performance/agents/useDownloadAgentsPerformanceData'
import { useAgentsTableConfigSetting } from 'domains/reporting/hooks/useAgentsTableConfigSetting'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { BusiestTimeOfDaysMetrics } from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import { createAgentsReport } from 'domains/reporting/services/agentsPerformanceReportingService'
import {
    initialState as agentPerformanceInitialState,
    getSortedAgents,
} from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { AGENT_PERFORMANCE_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'
import { agents } from 'fixtures/agents'
import { OrderDirection } from 'models/api/types'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

jest.mock('domains/reporting/hooks/common/useTableReportData')
const useTableReportDataMock = assumeMock(useTableReportData)

jest.mock('domains/reporting/hooks/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)
jest.mock('domains/reporting/services/agentsPerformanceReportingService')
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
            filters: { period },
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
    const rowsOrder: AgentsTableColumn[] = []
    const metricReturnValue = {
        isFetching: false,
        isError: false,
        data: { allData: [], value: null, decile: 0 },
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
            zeroTouchTicketsMetric: metricReturnValue,
            repliedTicketsPerHourMetric: metricReturnValue,
            onlineTimeMetric: metricReturnValue,
            messagesSentPerHourMetric: metricReturnValue,
            closedTicketsPerHourMetric: metricReturnValue,
            ticketHandleTimeMetric: metricReturnValue,
        },
        isLoading: false,
        period,
    }

    const agentsAverageData = {
        customerSatisfactionMetric: summaryMetricReturnValue,
        closedTicketsMetric: summaryMetricReturnValue,
        medianFirstResponseTimeMetric: summaryMetricReturnValue,
        messagesSentMetric: summaryMetricReturnValue,
        percentageOfClosedTicketsMetric: summaryMetricReturnValue,
        medianResolutionTimeMetric: summaryMetricReturnValue,
        ticketsRepliedMetric: summaryMetricReturnValue,
        oneTouchTicketsMetric: {
            ...summaryMetricReturnValue,
            data: { ...summaryMetricReturnValue.data, prevValue: 0 },
        },
        zeroTouchTicketsMetric: summaryMetricReturnValue,
        repliedTicketsPerHourMetric: summaryMetricReturnValue,
        onlineTimeMetric: summaryMetricReturnValue,
        messagesSentPerHourMetric: summaryMetricReturnValue,
        closedTicketsPerHourMetric: summaryMetricReturnValue,
        ticketHandleTimeMetric: summaryMetricReturnValue,
    }
    const agentsTotalData = {
        customerSatisfactionMetric: summaryMetricReturnValue,
        closedTicketsMetric: summaryMetricReturnValue,
        medianFirstResponseTimeMetric: summaryMetricReturnValue,
        messagesSentMetric: summaryMetricReturnValue,
        percentageOfClosedTicketsMetric: summaryMetricReturnValue,
        medianResolutionTimeMetric: summaryMetricReturnValue,
        ticketsRepliedMetric: summaryMetricReturnValue,
        oneTouchTicketsMetric: {
            ...summaryMetricReturnValue,
            data: { ...summaryMetricReturnValue.data, prevValue: 0 },
        },
        zeroTouchTicketsMetric: summaryMetricReturnValue,
        repliedTicketsPerHourMetric: summaryMetricReturnValue,
        onlineTimeMetric: summaryMetricReturnValue,
        messagesSentPerHourMetric: summaryMetricReturnValue,
        closedTicketsPerHourMetric: summaryMetricReturnValue,
        ticketHandleTimeMetric: summaryMetricReturnValue,
    }

    beforeEach(() => {
        useTableReportDataMock.mockReturnValueOnce({
            data: agentsMetricsReturnValue.reportData,
            isFetching: false,
        })
        useTableReportDataMock.mockReturnValueOnce({
            data: agentsAverageData,
            isFetching: false,
        })
        useTableReportDataMock.mockReturnValueOnce({
            data: agentsTotalData,
            isFetching: false,
        })
        useAgentsTableConfigSettingMock.mockReturnValue({
            columnsOrder: columnsOrder,
            rowsOrder,
        } as any)
    })

    it('Should return report files, file name and the loading state', () => {
        const fileName = getCsvFileNameWithDates(
            period,
            AGENTS_REPORT_FILE_NAME,
        )
        const report = {
            files: { ['file']: 'data' },
        }
        useTableReportDataMock.mockReturnValueOnce({
            data: agentsMetricsReturnValue.reportData,
            isFetching: true,
        })
        useTableReportDataMock.mockReturnValueOnce({
            data: agentsAverageData,
            isFetching: true,
        })
        useTableReportDataMock.mockReturnValueOnce({
            data: agentsTotalData,
            isFetching: true,
        })
        saveReportMock.mockReturnValue(report)

        const { result } = renderHook(
            () => useDownloadAgentsPerformanceData(),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(state)}>{children}</Provider>
                ),
            },
        )

        expect(saveReportMock).toHaveBeenCalledWith(
            getSortedAgents(state),
            agentsMetricsReturnValue.reportData,
            agentsAverageData,
            agentsTotalData,
            columnsOrder,
            rowsOrder,
            fileName,
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
            AGENTS_REPORT_FILE_NAME,
        )
        const report = {
            files: { ['file']: 'data' },
            fileName: getCsvFileNameWithDates(period, AGENTS_REPORT_FILE_NAME),
        }

        saveReportMock.mockReturnValue(report)

        const { result } = renderHook(
            () => useDownloadAgentsPerformanceData(),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(state)}>{children}</Provider>
                ),
            },
        )

        expect(saveReportMock).toHaveBeenCalledWith(
            getSortedAgents(state),
            agentsMetricsReturnValue.reportData,
            agentsAverageData,
            agentsTotalData,
            columnsOrder,
            rowsOrder,
            fileName,
        )
        expect(result.current).toEqual({
            ...report,
            isLoading: true,
        })
    })

    describe('fetchAgentsTableReportData', () => {
        const filters = { period }
        const userTimezone = 'UTC'
        const granularity = ReportingGranularity.Day
        const context = {
            agents: [],
            agentsQA: [],
            columnsOrder: [],
            rowsOrder: [],
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

        it('Should return report file name', async () => {
            const response = await fetchAgentsTableReportData(
                filters,
                userTimezone,
                granularity,
                context,
            )
            const fileName = getCsvFileNameWithDates(
                filters.period,
                AGENTS_REPORT_FILE_NAME,
            )

            expect(response).toEqual({
                isLoading: false,
                files: {},
                fileName,
            })
        })
    })
})
