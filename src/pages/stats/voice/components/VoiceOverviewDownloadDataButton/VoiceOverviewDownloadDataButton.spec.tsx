import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VoiceOverviewDownloadDataButton } from 'pages/stats/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
import { useVoiceOverviewReportData } from 'services/reporting/voiceOverviewReportingService'
import { saveZippedFiles } from 'utils/file'
import { assumeMock } from 'utils/testing'

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)

jest.mock('services/reporting/voiceOverviewReportingService')
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
    })
})
