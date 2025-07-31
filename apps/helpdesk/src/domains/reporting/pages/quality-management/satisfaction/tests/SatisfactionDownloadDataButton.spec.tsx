import React from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { SatisfactionDownloadDataButton } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionDownloadDataButton'
import {
    SATISFACTION_METRICS_FILE_NAME,
    useSatisfactionReportData,
} from 'domains/reporting/services/satisfactionReportingService'
import { saveZippedFiles } from 'utils/file'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/services/satisfactionReportingService')
const useSatisfactionReportDataMock = assumeMock(useSatisfactionReportData)
jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)
jest.mock('common/segment')
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
