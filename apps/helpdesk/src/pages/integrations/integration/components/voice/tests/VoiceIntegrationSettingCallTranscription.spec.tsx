import { FormField } from '@repo/forms'
import { assumeMock } from '@repo/testing'
import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import VoiceIntegrationSettingCallTranscription from '../VoiceIntegrationSettingCallTranscription'

jest.mock('@repo/forms')
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

    it('should close the banner when close button is clicked', () => {
        const { getByText, getByRole, queryByText } = renderComponent()

        expect(
            getByText(
                'Transcriptions are available in English, French, German, and Spanish; summaries are in English only.',
            ),
        ).toBeInTheDocument()

        const closeButton = getByRole('button', { name: /close/i })

        act(() => {
            userEvent.click(closeButton)
        })

        waitFor(() =>
            expect(
                queryByText(
                    'Transcriptions are available in English, French, German, and Spanish; summaries are in English only.',
                ),
            ).toBeNull(),
        )
    })
})
