import React from 'react'

import { assumeMock } from '@repo/testing'
import { act, fireEvent, render, screen } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { VoiceAgentsDownloadDataButton } from 'domains/reporting/pages/voice/components/VoiceAgentsDownloadDataButton/VoiceAgentsDownloadDataButton'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'domains/reporting/pages/voice/constants/voiceAgents'
import { useVoiceAgentsReportData } from 'domains/reporting/services/voiceAgentsReportingService'
import { saveZippedFiles } from 'utils/file'

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)
jest.mock('domains/reporting/services/voiceAgentsReportingService')
const useVoiceAgentsReportDataMock = assumeMock(useVoiceAgentsReportData)
jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)
jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('VoiceAgentsDownloadDataButton', () => {
    const renderComponent = () => render(<VoiceAgentsDownloadDataButton />)

    const files = {}
    const fileName = 'fileName'

    beforeEach(() => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.TransferCallToExternalNumber) {
                return true
            }
        })
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

    it('should pass true to useVoiceAgentsReportData', () => {
        renderComponent()

        expect(useFlagMock).toHaveBeenCalledWith(
            FeatureFlagKey.TransferCallToExternalNumber,
        )
        expect(useVoiceAgentsReportDataMock).toHaveBeenCalledWith(true)
    })

    it('should pass false to useVoiceAgentsReportData when new transfer FF is disabled', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.TransferCallToExternalNumber) {
                return false
            }
        })

        renderComponent()

        expect(useFlagMock).toHaveBeenCalledWith(
            FeatureFlagKey.TransferCallToExternalNumber,
        )
        expect(useVoiceAgentsReportDataMock).toHaveBeenCalledWith(false)
    })
})
