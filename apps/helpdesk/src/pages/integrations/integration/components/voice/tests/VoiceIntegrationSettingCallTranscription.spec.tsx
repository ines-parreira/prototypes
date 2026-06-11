import { Form } from '@repo/forms'
import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import VoiceIntegrationSettingCallTranscription from '../VoiceIntegrationSettingCallTranscription'

describe('VoiceIntegrationSettingCallTranscription', () => {
    const renderComponent = () =>
        render(
            <Form
                defaultValues={{
                    meta: {
                        preferences: {
                            transcribe: {
                                recordings: false,
                                voicemails: false,
                            },
                        },
                    },
                }}
                onValidSubmit={jest.fn()}
            >
                <VoiceIntegrationSettingCallTranscription />
            </Form>,
        )

    it('renders with language support message', () => {
        renderComponent()
        expect(screen.getByText('Call recording')).toBeInTheDocument()
        expect(screen.getByText('Voicemail')).toBeInTheDocument()
        expect(
            screen.getByText(/Transcripts are available in more than/i),
        ).toBeInTheDocument()
        expect(screen.getByText('50 languages')).toBeInTheDocument()
        expect(
            screen.getByText(/summaries are in English only/i),
        ).toBeInTheDocument()

        expect(screen.getAllByRole('switch')).toHaveLength(2)
    })

    it('renders link to supported languages', () => {
        renderComponent()
        const link = screen.getByRole('link', { name: /50 languages/i })
        expect(link).toHaveAttribute('href', 'https://link.gorgias.com/b87a76')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noreferrer')
    })

    it('closes the banner when close button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        expect(
            screen.getByText(/Transcripts are available in more than/i),
        ).toBeInTheDocument()

        const closeButton = screen.getByRole('button', { name: /close/i })

        await user.click(closeButton)

        await waitFor(() =>
            expect(
                screen.queryByText(/Transcripts are available in more than/i),
            ).not.toBeInTheDocument(),
        )
    })
})
