import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { AutoQADownloadDataButton } from 'domains/reporting/pages/support-performance/auto-qa/AutoQADownloadDataButton'
import { useAutoQAReportData } from 'domains/reporting/services/autoQAReportingService'
import { saveZippedFiles } from 'utils/file'

jest.mock('domains/reporting/services/autoQAReportingService')
const useAutoQAReportDataMock = assumeMock(useAutoQAReportData)

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

describe('ChannelsDownloadDataButton', () => {
    const isLoading = false
    const fileName = 'fileName'
    const files = { [fileName]: 'someReportData' }

    beforeEach(() => {
        useAutoQAReportDataMock.mockReturnValue({
            files,
            fileName,
            isLoading,
        })
    })

    it('should fetch data and allow calling the csv with report and report the click', () => {
        render(<AutoQADownloadDataButton />)
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
