import { render } from '@testing-library/react'

import { FormField } from 'core/forms'
import { assumeMock } from 'utils/testing'

import useIsCallbackRequestsEnabled from '../useIsCallbackRequestsEnabled'
import VoiceIntegrationSettingsFormCallFlowSection from '../VoiceIntegrationSettingsFormCallFlowSection'

jest.mock('core/forms')
const FormFieldMock = assumeMock(FormField).mockImplementation(
    ({ label }: any) => <div>{label}</div>,
)

jest.mock('../VoiceIntegrationSettingVoicemail', () => () => (
    <div>VoiceIntegrationSettingVoicemail</div>
))
jest.mock('../VoiceIntegrationSettingCallRecording', () => () => (
    <div>VoiceIntegrationSettingCallRecording</div>
))
jest.mock('../VoiceIntegrationSettingCallTranscription', () => () => (
    <div>VoiceIntegrationSettingCallTranscription</div>
))
jest.mock('../VoiceIntegrationSettingDistributionBehavior', () => () => (
    <div>VoiceIntegrationSettingDistributionBehavior</div>
))
jest.mock('../VoiceIntegrationSettingCallbackRequests', () => () => (
    <div>VoiceIntegrationSettingCallbackRequests</div>
))

jest.mock('../useIsCallbackRequestsEnabled')
const mockUseIsCallbackRequestsEnabled = assumeMock(
    useIsCallbackRequestsEnabled,
)

describe('VoiceIntegrationSettingsFormCallFlowSection', () => {
    const renderComponent = () =>
        render(<VoiceIntegrationSettingsFormCallFlowSection />)

    beforeEach(() => {
        mockUseIsCallbackRequestsEnabled.mockReturnValue(true)
    })

    it('should render', () => {
        const { getByText } = renderComponent()

        expect(getByText('Greeting message')).toBeInTheDocument()
        expect(getByText('Routing behavior')).toBeInTheDocument()
        expect(getByText('Voicemail')).toBeInTheDocument()
        expect(getByText('Call recording')).toBeInTheDocument()
        expect(getByText('Call transcription')).toBeInTheDocument()
        expect(getByText('Callback requests')).toBeInTheDocument()

        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.greeting_message',
            }),
            {},
        )
        expect(
            getByText('VoiceIntegrationSettingDistributionBehavior'),
        ).toBeInTheDocument()
        expect(
            getByText('VoiceIntegrationSettingVoicemail'),
        ).toBeInTheDocument()

        expect(
            getByText('VoiceIntegrationSettingCallRecording'),
        ).toBeInTheDocument()
        expect(
            getByText('VoiceIntegrationSettingCallTranscription'),
        ).toBeInTheDocument()
    })

    it('should not render callback requests if the feature flag is not enabled', () => {
        mockUseIsCallbackRequestsEnabled.mockReturnValue(false)
        const { queryByText } = renderComponent()
        expect(queryByText('Callback requests')).not.toBeInTheDocument()
    })
})
