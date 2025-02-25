import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { logEvent, SegmentEvent } from 'common/segment'
import { AutoQADownloadDataButton } from 'pages/stats/support-performance/auto-qa/AutoQADownloadDataButton'
import { useAutoQAReportData } from 'services/reporting/autoQAReportingService'
import { saveZippedFiles } from 'utils/file'
import { assumeMock } from 'utils/testing'

jest.mock('services/reporting/autoQAReportingService')
const useAutoQAReportDataMock = assumeMock(useAutoQAReportData)

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)

jest.mock('common/segment')
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
