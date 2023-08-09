import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'

import {agents} from 'fixtures/agents'
import {assumeMock} from 'utils/testing'
import {saveReport} from 'services/reporting/agentsPerformanceReportingService'
import {DownloadAgentsPerformanceDataButton} from 'pages/stats/DownloadAgentsPerformanceDataButton'
import {useAgentsMetrics} from 'pages/stats/useAgentsMetrics'
import {useAgentsSummaryMetrics} from 'pages/stats/useAgentsSummaryMetrics'

jest.mock('pages/stats/useAgentsMetrics')
jest.mock('pages/stats/useAgentsSummaryMetrics')
jest.mock('services/reporting/agentsPerformanceReportingService')
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)
const useAgentsSummaryMetricsMock = assumeMock(useAgentsSummaryMetrics)
const saveReportMock = assumeMock(saveReport)

describe('DownloadAgentsPerformanceDataButton', () => {
    const metricReturnValue = {
        isFetching: false,
        isError: false,
        data: {allData: [], value: null},
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
            firstResponseTimeMetric: metricReturnValue,
            messagesSentMetric: metricReturnValue,
            percentageOfClosedTicketsMetric: metricReturnValue,
            resolutionTimeMetric: metricReturnValue,
            ticketsRepliedMetric: metricReturnValue,
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
            firstResponseTimeMetric: summaryMetricReturnValue,
            messagesSentMetric: summaryMetricReturnValue,
            percentageOfClosedTicketsMetric: summaryMetricReturnValue,
            resolutionTimeMetric: summaryMetricReturnValue,
            ticketsRepliedMetric: summaryMetricReturnValue,
        },
        isLoading: false,
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
    }

    useAgentsMetricsMock.mockReturnValue(agentsMetricsReturnValue)
    useAgentsSummaryMetricsMock.mockReturnValue(agentsSummaryMetricsReturnValue)

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
})
