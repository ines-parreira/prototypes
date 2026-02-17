import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { saveZippedFiles } from '@repo/utils'
import { fireEvent, render, screen } from '@testing-library/react'

import AiSalesAgentOverviewDownloadButton, {
    DOWNLOAD_DATA_BUTTON_LABEL,
} from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentOverviewDownloadButton'
import useAiSalesAgentOverviewReportData from 'domains/reporting/pages/automate/aiSalesAgent/hooks/aiSalesAgentReportingService'

jest.mock('@repo/logging')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/hooks/aiSalesAgentReportingService',
)
const useAiSalesAgentOverviewReportDataMock = assumeMock(
    useAiSalesAgentOverviewReportData,
)

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

describe('<AiSalesAgentOverviewDownloadButton />', () => {
    const reportFileName = 'someFileName'
    beforeEach(() => {
        useAiSalesAgentOverviewReportDataMock.mockReturnValue({
            files: {},
            fileName: reportFileName,
            isLoading: false,
        })
    })

    it('should render download button', () => {
        render(<AiSalesAgentOverviewDownloadButton />)
        expect(screen.getByText(DOWNLOAD_DATA_BUTTON_LABEL)).toBeInTheDocument()
    })

    it('should send event to segment and call saveReport on download data button click', () => {
        const { getByText } = render(<AiSalesAgentOverviewDownloadButton />)
        fireEvent.click(getByText(DOWNLOAD_DATA_BUTTON_LABEL))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            }),
        )
        expect(saveZippedFilesMock).toHaveBeenCalledWith({}, reportFileName)
    })
})
