import React from 'react'
import {render, screen, fireEvent, act} from '@testing-library/react'

import {agents} from 'fixtures/agents'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
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
jest.mock('services/reporting/agentsPerformanceReportingService')
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)
const useAgentsSummaryMetricsMock = assumeMock(useAgentsSummaryMetrics)
const saveReportMock = assumeMock(saveReport)
jest.mock('store/middlewares/segmentTracker')
const logEventMock = assumeMock(logEvent)

describe('DownloadAgentsPerformanceDataButton', () => {
    const metricReturnValue = {
        isFetching: false,
        isError: false,
        data: {allData: [], value: null, decile: null},
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

    beforeEach(() => {
        useAgentsMetricsMock.mockReturnValue(agentsMetricsReturnValue)
        useAgentsSummaryMetricsMock.mockReturnValue(
            agentsSummaryMetricsReturnValue
        )
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
