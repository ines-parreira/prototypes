import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {useAutoQAMetrics} from 'hooks/reporting/support-performance/auto-qa/useAutoQAMetrics'
import {
    AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER,
    AUTO_QA_AGENTS_TABLE_MANUAL_DIMENSIONS_COLUMNS_ORDER,
} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import {AutoQADownloadDataButton} from 'pages/stats/support-performance/auto-qa/AutoQADownloadDataButton'
import * as autoQAReportingService from 'services/reporting/autoQAReportingService'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/support-performance/auto-qa/useAutoQAMetrics')
const useAutoQAMetricsMock = assumeMock(useAutoQAMetrics)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('ChannelsDownloadDataButton', () => {
    const reportData = {} as any
    const isLoading = false
    const period = {
        start_datetime: '2021-04-02T00:00:00.000Z',
        end_datetime: '2021-04-02T23:59:59.999Z',
    }

    beforeEach(() => {
        useAutoQAMetricsMock.mockReturnValue({
            reportData,
            isLoading,
            period,
        })
        mockFlags({
            [FeatureFlagKey.AutoQaManualDimensions]: true,
        })
    })

    it('should fetch data and allow calling the csv with report and report the click', () => {
        const reportServiceSpy = jest
            .spyOn(autoQAReportingService, 'saveReport')
            .mockReturnValue({} as any)

        render(<AutoQADownloadDataButton />)
        userEvent.click(screen.getByRole('button'))

        expect(reportServiceSpy).toHaveBeenCalledWith(
            reportData,
            AUTO_QA_AGENTS_TABLE_MANUAL_DIMENSIONS_COLUMNS_ORDER,
            period
        )
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
    })

    it('should call report without manual dimensions', () => {
        mockFlags({
            [FeatureFlagKey.AutoQaManualDimensions]: false,
        })
        const reportServiceSpy = jest
            .spyOn(autoQAReportingService, 'saveReport')
            .mockReturnValue({} as any)

        render(<AutoQADownloadDataButton />)
        userEvent.click(screen.getByRole('button'))

        expect(reportServiceSpy).toHaveBeenCalledWith(
            reportData,
            AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER,
            period
        )
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
    })
})
