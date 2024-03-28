import React from 'react'
import {render, screen, fireEvent, act} from '@testing-library/react'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'

import {agents} from 'fixtures/agents'
import {logEvent, SegmentEvent} from 'common/segment'
import {TableColumn} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'
import {saveReport} from 'services/reporting/agentsPerformanceReportingService'
import {
    DownloadAgentsPerformanceDataButton,
    DOWNLOAD_DATA_BUTTON_LABEL,
} from 'pages/stats/DownloadAgentsPerformanceDataButton'
import {useAgentsMetrics} from 'hooks/reporting/useAgentsMetrics'
import {useAgentsSummaryMetrics} from 'hooks/reporting/useAgentsSummaryMetrics'

jest.mock('hooks/reporting/useAgentsMetrics')
jest.mock('hooks/reporting/useAgentsSummaryMetrics')
jest.mock('hooks/reporting/useAgentsTableConfigSetting')
jest.mock('services/reporting/agentsPerformanceReportingService')
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)
const useAgentsSummaryMetricsMock = assumeMock(useAgentsSummaryMetrics)
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)
const saveReportMock = assumeMock(saveReport)
jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('DownloadAgentsPerformanceDataButton', () => {
    const columnsOrder = Object.values(TableColumn)
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

    it('should render', () => {
        render(<DownloadAgentsPerformanceDataButton />)

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should call saveReport on click', () => {
        render(<DownloadAgentsPerformanceDataButton />)

        fireEvent.click(screen.getByRole('button'))
        expect(saveReportMock).toHaveBeenCalledWith(
            agentsMetricsReturnValue.reportData,
            agentsSummaryMetricsReturnValue.summaryData,
            columnsOrder,
            false,
            agentsMetricsReturnValue.period
        )
    })

    it('should be disabled', () => {
        useAgentsMetricsMock.mockReturnValue({
            ...agentsMetricsReturnValue,
            isLoading: true,
        })
        render(<DownloadAgentsPerformanceDataButton />)

        expect(screen.getByRole('button')).toHaveAttribute(
            'aria-disabled',
            'true'
        )
    })

    it('should send event to segment and call saveReport on download data button click', () => {
        const {getByText} = render(<DownloadAgentsPerformanceDataButton />)
        act(() => {
            fireEvent.click(getByText(DOWNLOAD_DATA_BUTTON_LABEL))
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
        expect(saveReportMock).toHaveBeenCalled()
    })
})
