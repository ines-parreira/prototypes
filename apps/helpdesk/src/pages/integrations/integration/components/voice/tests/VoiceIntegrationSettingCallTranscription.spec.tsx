import { useFlag } from '@repo/feature-flags'
import { FormField } from '@repo/forms'
import { assumeMock } from '@repo/testing'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import VoiceIntegrationSettingCallTranscription from '../VoiceIntegrationSettingCallTranscription'

jest.mock('@repo/forms')
jest.mock('@repo/feature-flags')
const FormFieldMock = assumeMock(FormField)
const useFlagMock = assumeMock(useFlag)

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
        useFlagMock.mockReturnValue(false)
    })

    describe('when AssemblyAI feature flag is disabled', () => {
        it('it renders with standard language support message', () => {
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

        it('should close the banner when close button is clicked', async () => {
            const user = userEvent.setup()
            const { getByText, getByRole, queryByText } = renderComponent()

            expect(
                getByText(
                    'Transcriptions are available in English, French, German, and Spanish; summaries are in English only.',
                ),
            ).toBeInTheDocument()

            const closeButton = getByRole('button', { name: /close/i })

            await user.click(closeButton)

            await waitFor(() =>
                expect(
                    queryByText(
                        'Transcriptions are available in English, French, German, and Spanish; summaries are in English only.',
                    ),
                ).not.toBeInTheDocument(),
            )
        })
    })

    describe('when AssemblyAI feature flag is enabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        it('it renders with enhanced language support message', () => {
            const { getByText } = renderComponent()
            expect(getByText('Call recording')).toBeInTheDocument()
            expect(getByText('Voicemail')).toBeInTheDocument()
            expect(
                getByText(/Transcripts are available in more than/i),
            ).toBeInTheDocument()
            expect(getByText('50 languages')).toBeInTheDocument()
            expect(
                getByText(/summaries are in English only/i),
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

        it('should render link to supported languages', () => {
            const { getByRole } = renderComponent()
            const link = getByRole('link', { name: /50 languages/i })
            expect(link).toHaveAttribute(
                'href',
                'https://link.gorgias.com/b87a76',
            )
            expect(link).toHaveAttribute('target', '_blank')
            expect(link).toHaveAttribute('rel', 'noreferrer')
        })

        it('should close the banner when close button is clicked', async () => {
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
})
