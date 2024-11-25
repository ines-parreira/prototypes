import {renderHook} from '@testing-library/react-hooks'

import {agents} from 'fixtures/agents'
import {useDownloadAgentsPerformanceData} from 'hooks/reporting/support-performance/agents/useDownloadAgentsPerformanceData'
import {useAgentsMetrics} from 'hooks/reporting/useAgentsMetrics'
import {useAgentsSummaryMetrics} from 'hooks/reporting/useAgentsSummaryMetrics'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import {saveReport} from 'services/reporting/agentsPerformanceReportingService'
import {AgentsTableColumn} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useAgentsMetrics')
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)
jest.mock('hooks/reporting/useAgentsSummaryMetrics')
const useAgentsSummaryMetricsMock = assumeMock(useAgentsSummaryMetrics)
jest.mock('hooks/reporting/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)
jest.mock('services/reporting/agentsPerformanceReportingService')
const saveReportMock = assumeMock(saveReport)

describe('useDownloadAgentsPerformanceData', () => {
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
            agents,
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
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
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
        useAgentsMetricsMock.mockReturnValue(agentsMetricsReturnValue)
        useAgentsSummaryMetricsMock.mockReturnValue(
            agentsSummaryMetricsReturnValue
        )
        useAgentsTableConfigSettingMock.mockReturnValue({
            columnsOrder: columnsOrder,
        } as any)
    })

    it('Should return report files, file name and the loading state', () => {
        const report = {
            files: {['file']: 'data'},
            fileName: 'someName',
        }
        saveReportMock.mockReturnValue(report)

        const {result} = renderHook(() => useDownloadAgentsPerformanceData())

        expect(saveReportMock).toHaveBeenCalledWith(
            agentsMetricsReturnValue.reportData,
            agentsSummaryMetricsReturnValue.summaryData,
            columnsOrder,
            agentsMetricsReturnValue.period
        )
        expect(result.current).toEqual({
            ...report,
            isLoading: false,
        })
    })

    it('Should return loading state', () => {
        const report = {
            files: {['file']: 'data'},
            fileName: 'someName',
        }
        saveReportMock.mockReturnValue(report)
        useAgentsMetricsMock.mockReturnValue({
            ...agentsMetricsReturnValue,
            isLoading: true,
        })

        const {result} = renderHook(() => useDownloadAgentsPerformanceData())

        expect(saveReportMock).toHaveBeenCalledWith(
            agentsMetricsReturnValue.reportData,
            agentsSummaryMetricsReturnValue.summaryData,
            columnsOrder,
            agentsMetricsReturnValue.period
        )
        expect(result.current).toEqual({
            ...report,
            isLoading: true,
        })
    })
})
