import React from 'react'

import { act, fireEvent, screen } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'pages/stats/constants'
import { TagsReportDownloadDataButton } from 'pages/stats/ticket-insights/tags/TagsReportDownloadDataButton'
import { useTagsReportData } from 'services/reporting/tagsReportingService'
import { saveZippedFiles } from 'utils/file'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('services/reporting/tagsReportingService')
const useTagsReportDataMock = assumeMock(useTagsReportData)

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('<TagsReportDownloadDataButton />', () => {
    const fileName = 'someFileName'
    const report = 'reportData'
    const reportFiles = {
        [fileName]: report,
    }

    beforeEach(() => {
        useTagsReportDataMock.mockReturnValue({
            files: reportFiles,
            fileName,
            isLoading: false,
        })
    })

    it('should render the Button', () => {
        renderWithStore(<TagsReportDownloadDataButton />, {})

        expect(
            screen.getByRole('button', {
                name: new RegExp(DOWNLOAD_DATA_BUTTON_LABEL),
            }),
        ).toBeInTheDocument()
    })

    it('should call SaveReport on click', () => {
        renderWithStore(<TagsReportDownloadDataButton />, {})

        fireEvent.click(screen.getByRole('button'))

        expect(saveZippedFilesMock).toHaveBeenCalledWith(reportFiles, fileName)
    })

    it('should send event to segment and call saveReport on download data button click', () => {
        renderWithStore(<TagsReportDownloadDataButton />, {})

        act(() => {
            fireEvent.click(screen.getByRole('button'))
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            }),
        )
    })
})
