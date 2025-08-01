import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { VoiceOverviewDownloadDataButton } from 'domains/reporting/pages/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
import { useVoiceOverviewReportData } from 'domains/reporting/services/voiceOverviewReportingService'
import { saveZippedFiles } from 'utils/file'

jest.mock('utils/file')
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
