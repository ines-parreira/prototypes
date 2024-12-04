import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {useSatisfactionMetrics} from 'hooks/reporting/quality-management/satisfaction/useSatisfactionMetrics'
import {SatisfactionDownloadDataButton} from 'pages/stats/quality-management/satisfaction/SatisfactionDownloadDataButton'
import * as satisfactionReportingService from 'services/reporting/satisfactionReportingService'
import {assumeMock} from 'utils/testing'

jest.mock(
    'hooks/reporting/quality-management/satisfaction/useSatisfactionMetrics'
)
const useSatisfactionMetricsMock = assumeMock(useSatisfactionMetrics)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('SatisfactionDownloadDataButton', () => {
    const reportData = {} as any
    const isLoading = false
    const period = {
        start_datetime: '2021-04-02T00:00:00.000Z',
        end_datetime: '2021-04-02T23:59:59.999Z',
    }

    beforeEach(() => {
        useSatisfactionMetricsMock.mockReturnValue({
            reportData,
            isLoading,
            period,
        })
    })

    it('should fetch data and allow calling the csv with report and report the click', () => {
        const reportServiceSpy = jest
            .spyOn(satisfactionReportingService, 'saveReport')
            .mockReturnValue({} as any)

        render(<SatisfactionDownloadDataButton />)
        userEvent.click(screen.getByRole('button'))

        expect(reportServiceSpy).toHaveBeenCalledWith(reportData, period)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
    })

    it('should call report without Language Proficiency', () => {
        const reportServiceSpy = jest
            .spyOn(satisfactionReportingService, 'saveReport')
            .mockReturnValue({} as any)

        render(<SatisfactionDownloadDataButton />)
        userEvent.click(screen.getByRole('button'))

        expect(reportServiceSpy).toHaveBeenCalledWith(reportData, period)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
    })
})
