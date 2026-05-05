import { FormField } from '@repo/forms'
import { assumeMock, render } from '@repo/testing'
import { waitFor } from '@testing-library/react'
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

    it('renders with language support message', () => {
        const { getByText } = renderComponent()
        expect(getByText('Call recording')).toBeInTheDocument()
        expect(getByText('Voicemail')).toBeInTheDocument()
        expect(
            getByText(/Transcripts are available in more than/i),
        ).toBeInTheDocument()
        expect(getByText('50 languages')).toBeInTheDocument()
        expect(getByText(/summaries are in English only/i)).toBeInTheDocument()

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

    it('renders link to supported languages', () => {
        const { getByRole } = renderComponent()
        const link = getByRole('link', { name: /50 languages/i })
        expect(link).toHaveAttribute('href', 'https://link.gorgias.com/b87a76')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noreferrer')
    })

    it('closes the banner when close button is clicked', async () => {
        const user = userEvent.setup()
        const { getByText, getByRole, queryByText } = renderComponent()

        expect(
            getByText(/Transcripts are available in more than/i),
        ).toBeInTheDocument()

        const closeButton = getByRole('button', { name: /close/i })

        await user.click(closeButton)

        await waitFor(() =>
            expect(
                queryByText(/Transcripts are available in more than/i),
            ).not.toBeInTheDocument(),
        )
    })
})
