import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { VoiceOverviewDownloadDataButton } from 'pages/stats/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
import {
    DEPRECATED_useVoiceOverviewReportData,
    useVoiceOverviewReportData,
} from 'services/reporting/voiceOverviewReportingService'
import { saveZippedFiles } from 'utils/file'
import { assumeMock } from 'utils/testing'

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)

jest.mock('services/reporting/voiceOverviewReportingService')
const useVoiceOverviewReportDataMock = assumeMock(useVoiceOverviewReportData)
const DEPRECATED_useVoiceOverviewReportDataMock = assumeMock(
    DEPRECATED_useVoiceOverviewReportData,
)

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

describe('DEPRECATED_VoiceOverviewDownloadDataButton', () => {
    beforeEach(() => {
        DEPRECATED_useVoiceOverviewReportDataMock.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ShowNewUnansweredStatuses) {
                return false
            }
        })
    })

    const renderComponent = () => {
        return render(<VoiceOverviewDownloadDataButton />)
    }

    it('should be disabled when loading', () => {
        DEPRECATED_useVoiceOverviewReportDataMock.mockReturnValue({
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

describe('VoiceOverviewDownloadDataButton', () => {
    beforeEach(() => {
        useVoiceOverviewReportDataMock.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ShowNewUnansweredStatuses) {
                return true
            }
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
