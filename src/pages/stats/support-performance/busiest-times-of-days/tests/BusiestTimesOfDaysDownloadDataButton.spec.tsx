import React from 'react'

import { act, render, screen } from '@testing-library/react'

import * as segment from 'common/segment'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'pages/stats/constants'
import { BusiestTimesOfDaysDownloadDataButton } from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton'
import { useAggregatedBusiestTimesOfDayReportData } from 'services/reporting/busiestTimesOfDaysReportingService'
import { saveZippedFiles } from 'utils/file'
import { assumeMock } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)
jest.mock('services/reporting/busiestTimesOfDaysReportingService')
const useAggregatedBusiestTimesOfDayReportDataMock = assumeMock(
    useAggregatedBusiestTimesOfDayReportData,
)

describe('BusiestTimesOfDaysDownloadDataButton', () => {
    const fileName = 'someFileName'
    const reportData = {
        files: {
            [fileName]: 'someData',
        },
        fileName,
        isLoading: false,
    }

    beforeEach(() => {
        useAggregatedBusiestTimesOfDayReportDataMock.mockReturnValue(reportData)
    })

    it('should pass provided query to the data hook', () => {
        const querySpy = jest.fn()

        render(
            <BusiestTimesOfDaysDownloadDataButton useMetricQuery={querySpy} />,
        )

        expect(
            useAggregatedBusiestTimesOfDayReportDataMock,
        ).toHaveBeenCalledWith(querySpy)
    })

    it('should call logEvent and saveReport on click', () => {
        const querySpy = jest.fn()
        const logEventSpy = jest.spyOn(segment, 'logEvent')

        render(
            <BusiestTimesOfDaysDownloadDataButton useMetricQuery={querySpy} />,
        )
        const button = screen.getByText(DOWNLOAD_DATA_BUTTON_LABEL)
        act(() => {
            userEvent.click(button)
        })

        expect(logEventSpy).toHaveBeenCalled()
        expect(saveZippedFilesMock).toHaveBeenCalledWith(
            reportData.files,
            fileName,
        )
    })
})
