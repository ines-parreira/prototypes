import { render } from '@testing-library/react'

import { FormField } from 'core/forms'
import { assumeMock } from 'utils/testing'

import VoiceIntegrationSettingCallTranscription from '../VoiceIntegrationSettingCallTranscription'

jest.mock('core/forms')
const FormFieldMock = assumeMock(FormField)

describe('VoiceIntegrationSettingCallTranscription', () => {
    const renderComponent = () =>
        render(<VoiceIntegrationSettingCallTranscription />)

    beforeEach(() => {
        FormFieldMock.mockImplementation(({ children, label }: any) => (
            <div>
                <div>{label}</div>
                <div>{children}</div>
            </div>
        ))
    })

    it('it renders', () => {
        const { getByText } = renderComponent()
        expect(getByText('Call recording')).toBeInTheDocument()
        expect(getByText('Voicemail')).toBeInTheDocument()
        expect(
            getByText(
                'Transcriptions are available in English, French, German, and Spanish; summaries are in English only.',
            ),
        ).toBeInTheDocument()

        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.preferences.transcribe.recordings',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.preferences.transcribe.voicemails',
            }),
            {},
        )
    })
})
