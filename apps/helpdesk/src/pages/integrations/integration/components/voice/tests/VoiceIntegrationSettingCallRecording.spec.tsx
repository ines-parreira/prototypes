import { screen } from '@testing-library/react'

import { Form } from 'core/forms'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import VoiceIntegrationSettingCallRecording from '../VoiceIntegrationSettingCallRecording'
import type { TextToSpeechContext as TextToSpeechContextType } from '../VoiceMessageTTS/TextToSpeechContext'
import TextToSpeechContext from '../VoiceMessageTTS/TextToSpeechContext'

const defaultPreferences = {
    record_inbound_calls: false,
    record_outbound_calls: false,
}

describe('VoiceIntegrationSettingCallRecording', () => {
    const renderComponent = (preferences = defaultPreferences) =>
        renderWithStoreAndQueryClientProvider(
            <Form
                defaultValues={{
                    meta: {
                        preferences,
                        recording_notification: {},
                    },
                }}
                onValidSubmit={jest.fn()}
            >
                <TextToSpeechContext.Provider
                    value={{ integrationId: 123 } as TextToSpeechContextType}
                >
                    <VoiceIntegrationSettingCallRecording integrationId={123} />
                </TextToSpeechContext.Provider>
            </Form>,
        )

    it('renders with toggles on', () => {
        renderComponent({
            record_outbound_calls: true,
            record_inbound_calls: true,
        })
        expect(screen.getByText('Outbound calls')).toBeInTheDocument()
        expect(screen.getByText('Inbound calls')).toBeInTheDocument()
        expect(
            screen.getByText('Call recording notification'),
        ).toBeInTheDocument()

        expect(screen.getAllByRole('checkbox')[0]).toBeChecked()
        expect(screen.getAllByRole('checkbox')[1]).toBeChecked()

        expect(
            screen.getByText(
                /We recommend you include the call recording notification in your welcome message/,
            ),
        ).toBeInTheDocument()
    })

    it('renders with toggles off', () => {
        renderComponent({
            record_outbound_calls: false,
            record_inbound_calls: false,
        })
        expect(screen.getByText('Outbound calls')).toBeInTheDocument()
        expect(screen.getByText('Inbound calls')).toBeInTheDocument()

        expect(
            screen.queryByText('Call recording notification'),
        ).not.toBeInTheDocument()

        expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked()
        expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked()

        expect(
            screen.queryByText(
                /We recommend you include the call recording notification in your welcome message/,
            ),
        ).not.toBeInTheDocument()
    })
})
