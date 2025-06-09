import { render, screen } from '@testing-library/react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { VoiceOverviewDownloadDataButton } from 'pages/stats/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
import { useVoiceOverviewReportData } from 'services/reporting/voiceOverviewReportingService'
import { saveZippedFiles } from 'utils/file'
import { assumeMock } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)

jest.mock('services/reporting/voiceOverviewReportingService')
const useVoiceOverviewReportDataMock = assumeMock(useVoiceOverviewReportData)

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

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

    it.each([true, false])(
        'should call saveReport onClick',
        (isCallbackRequestsEnabled: boolean) => {
            useFlagMock.mockImplementation((flag) => {
                if (
                    flag === FeatureFlagKey.VoiceCallbackEnabled1 ||
                    flag === FeatureFlagKey.VoiceCallbackEnabled2
                ) {
                    return isCallbackRequestsEnabled
                }
            })

            renderComponent()
            const button = screen.getByRole('button')
            userEvent.click(button)

            expect(saveZippedFilesMock).toHaveBeenCalledTimes(1)

            expect(useVoiceOverviewReportDataMock).toHaveBeenCalledWith(
                isCallbackRequestsEnabled,
            )
        },
    )
})
