import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { saveZippedFiles } from '@repo/utils'
import { act, fireEvent, render, screen } from '@testing-library/react'

import { VoiceAgentsDownloadDataButton } from 'domains/reporting/pages/voice/components/VoiceAgentsDownloadDataButton/VoiceAgentsDownloadDataButton'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'domains/reporting/pages/voice/constants/voiceAgents'
import { useVoiceAgentsReportData } from 'domains/reporting/services/voiceAgentsReportingService'

jest.mock('domains/reporting/services/voiceAgentsReportingService')
const useVoiceAgentsReportDataMock = assumeMock(useVoiceAgentsReportData)
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

describe('VoiceAgentsDownloadDataButton', () => {
    const renderComponent = () => render(<VoiceAgentsDownloadDataButton />)

    const files = {}
    const fileName = 'fileName'

    beforeEach(() => {
        useVoiceAgentsReportDataMock.mockReturnValue({
            files,
            fileName,
            isLoading: false,
        })
    })

    it('should render', () => {
        renderComponent()

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should call saveReport on click', () => {
        renderComponent()

        fireEvent.click(screen.getByRole('button'))
        expect(saveZippedFilesMock).toHaveBeenCalledWith(files, fileName)
    })

    it('should be disabled', () => {
        useVoiceAgentsReportDataMock.mockReturnValue({
            files,
            fileName,
            isLoading: true,
        })
        renderComponent()

        expect(screen.getByRole('button')).toBeAriaDisabled()
    })

    it('should send event to segment and call saveReport on download data button click', () => {
        const { getByText } = renderComponent()
        act(() => {
            fireEvent.click(getByText(DOWNLOAD_DATA_BUTTON_LABEL))
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            }),
        )
        expect(saveZippedFilesMock).toHaveBeenCalled()
    })
})
