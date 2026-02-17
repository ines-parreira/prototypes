import React from 'react'

import * as segment from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { saveZippedFiles } from '@repo/utils'
import { act, render, screen } from '@testing-library/react'

import { DOWNLOAD_DATA_BUTTON_LABEL } from 'domains/reporting/pages/constants'
import { BusiestTimesOfDaysDownloadDataButton } from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton'
import { useAggregatedBusiestTimesOfDayReportData } from 'domains/reporting/services/busiestTimesOfDaysReportingService'

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    saveZippedFiles: jest.fn(),
    saveFileAsDownloaded: jest.fn(),
    saveBlobAsDownloaded: jest.fn(),
    createCsv: jest.fn(),
    getText: jest.fn(),
    getBase64: jest.fn(),
    getFileTooLargeError: jest.fn(),
}))
const saveZippedFilesMock = assumeMock(saveZippedFiles)
jest.mock('domains/reporting/services/busiestTimesOfDaysReportingService')
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
