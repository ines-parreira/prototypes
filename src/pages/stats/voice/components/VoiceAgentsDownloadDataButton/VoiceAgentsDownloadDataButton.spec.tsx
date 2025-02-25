import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import { VoiceAgentsDownloadDataButton } from 'pages/stats/voice/components/VoiceAgentsDownloadDataButton/VoiceAgentsDownloadDataButton'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'pages/stats/voice/constants/voiceAgents'
import { useVoiceAgentsReportData } from 'services/reporting/voiceAgentsReportingService'
import { saveZippedFiles } from 'utils/file'
import { assumeMock } from 'utils/testing'

jest.mock('services/reporting/voiceAgentsReportingService')
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
