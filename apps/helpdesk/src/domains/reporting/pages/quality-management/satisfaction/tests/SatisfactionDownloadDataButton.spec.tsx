import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { saveZippedFiles } from '@repo/utils'
import { render, screen } from '@testing-library/react'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { SatisfactionDownloadDataButton } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionDownloadDataButton'
import {
    SATISFACTION_METRICS_FILE_NAME,
    useSatisfactionReportData,
} from 'domains/reporting/services/satisfactionReportingService'

jest.mock('domains/reporting/services/satisfactionReportingService')
const useSatisfactionReportDataMock = assumeMock(useSatisfactionReportData)
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

describe('SatisfactionDownloadDataButton', () => {
    const reportData = 'someData'
    const isLoading = false
    const period = {
        start_datetime: '2021-04-02T00:00:00.000Z',
        end_datetime: '2021-04-02T23:59:59.999Z',
    }
    const fileName = getCsvFileNameWithDates(
        period,
        SATISFACTION_METRICS_FILE_NAME,
    )
    const files = {
        [fileName]: reportData,
    }

    beforeEach(() => {
        useSatisfactionReportDataMock.mockReturnValue({
            files,
            fileName,
            isLoading,
        })
    })

    it('should fetch data and allow calling the csv with report and report the click', () => {
        render(<SatisfactionDownloadDataButton />)
        userEvent.click(screen.getByRole('button'))

        expect(saveZippedFilesMock).toHaveBeenCalledWith(files, fileName)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            }),
        )
    })

    it('should call report without Language Proficiency', () => {
        render(<SatisfactionDownloadDataButton />)
        userEvent.click(screen.getByRole('button'))

        expect(saveZippedFilesMock).toHaveBeenCalledWith(files, fileName)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            }),
        )
    })
})
