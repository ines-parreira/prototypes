import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { saveZippedFiles } from '@repo/utils'
import { fireEvent, render } from '@testing-library/react'

import { AutomateOverviewDownloadDataButton } from 'domains/reporting/pages/automate/overview/AutomateOverviewDownloadDataButton'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'domains/reporting/pages/constants'
import { useAutomateOverviewReportData } from 'domains/reporting/services/automateOverviewReportingService'

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

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

jest.mock('domains/reporting/services/automateOverviewReportingService')
const useAutomateOverviewReportDataMock = assumeMock(
    useAutomateOverviewReportData,
)

describe('AutomateOverviewDownloadDataButton', () => {
    const fileName = 'someFileName'
    const reportFiles = {
        [fileName]: 'someReport',
    }
    beforeEach(() => {
        useAutomateOverviewReportDataMock.mockReturnValue({
            files: reportFiles,
            fileName,
            isLoading: false,
        })
    })

    it('should send event to segment and call saveReport on download data button click', () => {
        const { getByText } = render(<AutomateOverviewDownloadDataButton />)
        fireEvent.click(getByText(DOWNLOAD_DATA_BUTTON_LABEL))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            }),
        )
        expect(saveZippedFilesMock).toHaveBeenCalledWith(reportFiles, fileName)
    })
})
