import React from 'react'
import {render, screen, fireEvent, act} from '@testing-library/react'

import {agents} from 'fixtures/agents'
import {logEvent, SegmentEvent} from 'common/segment'
import {assumeMock} from 'utils/testing'
import {useVoiceAgentsMetrics} from 'pages/stats/voice/hooks/useVoiceAgentsMetrics'
import {useVoiceAgentsSummaryMetrics} from 'pages/stats/voice/hooks/useVoiceAgentsSummaryMetrics'
import {saveReport} from 'services/reporting/voiceAgentsReportingService'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/voice/constants/voiceAgents'
import {VoiceAgentsDownloadDataButton} from './VoiceAgentsDownloadDataButton'

jest.mock('pages/stats/voice/hooks/useVoiceAgentsMetrics')
jest.mock('pages/stats/voice/hooks/useVoiceAgentsSummaryMetrics')
jest.mock('services/reporting/voiceAgentsReportingService')
const useVoiceAgentsMetricsMock = assumeMock(useVoiceAgentsMetrics)
const useVoiceAgentsSummaryMetricsMock = assumeMock(
    useVoiceAgentsSummaryMetrics
)
const saveReportMock = assumeMock(saveReport)
jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('VoiceAgentsDownloadDataButton', () => {
    const renderComponent = () => render(<VoiceAgentsDownloadDataButton />)

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

    const voiceAgentsMetricsReturnValue = {
        reportData: {
            agents,
            totalCallsMetric: metricReturnValue,
            answeredCallsMetric: metricReturnValue,
            missedCallsMetric: metricReturnValue,
            declinedCallsMetric: metricReturnValue,
            outboundCallsMetric: metricReturnValue,
            averageTalkTimeMetric: metricReturnValue,
        },
        isLoading: false,
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
    }

    const voiceAgentsSummaryMetricsReturnValue = {
        summaryData: {
            totalCallsMetric: summaryMetricReturnValue,
            answeredCallsMetric: summaryMetricReturnValue,
            missedCallsMetric: summaryMetricReturnValue,
            declinedCallsMetric: summaryMetricReturnValue,
            outboundCallsMetric: summaryMetricReturnValue,
            averageTalkTimeMetric: summaryMetricReturnValue,
        },
        isLoading: false,
        period: {
            start_datetime: '2023-02-03T00:00:00.000Z',
            end_datetime: '2023-02-03T23:59:59.999Z',
        },
    }

    beforeEach(() => {
        useVoiceAgentsMetricsMock.mockReturnValue(voiceAgentsMetricsReturnValue)
        useVoiceAgentsSummaryMetricsMock.mockReturnValue(
            voiceAgentsSummaryMetricsReturnValue
        )
    })

    it('should render', () => {
        renderComponent()

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should call saveReport on click', () => {
        renderComponent()

        fireEvent.click(screen.getByRole('button'))
        expect(saveReportMock).toHaveBeenCalledWith(
            voiceAgentsMetricsReturnValue.reportData,
            voiceAgentsSummaryMetricsReturnValue.summaryData,
            voiceAgentsMetricsReturnValue.period
        )
    })

    it('should be disabled', () => {
        useVoiceAgentsMetricsMock.mockReturnValue({
            ...voiceAgentsMetricsReturnValue,
            isLoading: true,
        })
        renderComponent()

        expect(screen.getByRole('button')).toHaveAttribute(
            'aria-disabled',
            'true'
        )
    })

    it('should send event to segment and call saveReport on download data button click', () => {
        const {getByText} = renderComponent()
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
