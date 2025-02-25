import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'pages/stats/constants'
import { useAutomateOverviewReportData } from 'services/reporting/automateOverviewReportingService'
import { saveZippedFiles } from 'utils/file'
import { assumeMock } from 'utils/testing'

import { AutomateOverviewDownloadDataButton } from '../AutomateOverviewDownloadDataButton'

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

jest.mock('services/reporting/automateOverviewReportingService')
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
