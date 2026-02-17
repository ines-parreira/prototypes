import { assumeMock, userEvent } from '@repo/testing'
import { saveZippedFiles } from '@repo/utils'
import { render, screen } from '@testing-library/react'

import { VoiceOverviewDownloadDataButton } from 'domains/reporting/pages/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
import { useVoiceOverviewReportData } from 'domains/reporting/services/voiceOverviewReportingService'

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

jest.mock('domains/reporting/services/voiceOverviewReportingService')
const useVoiceOverviewReportDataMock = assumeMock(useVoiceOverviewReportData)

describe('VoiceOverviewDownloadDataButton', () => {
    beforeEach(() => {
        useVoiceOverviewReportDataMock.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })
    })

    const renderComponent = () => {
        return render(<VoiceOverviewDownloadDataButton />)
    }

    it('should be disabled when loading', () => {
        useVoiceOverviewReportDataMock.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })
        renderComponent()
        const button = screen.getByRole('button')

        expect(button).toBeAriaDisabled()
    })

    it('should call saveReport onClick', () => {
        renderComponent()
        const button = screen.getByRole('button')
        userEvent.click(button)

        expect(saveZippedFilesMock).toHaveBeenCalledTimes(1)

        expect(useVoiceOverviewReportDataMock).toHaveBeenCalledWith()
    })
})
