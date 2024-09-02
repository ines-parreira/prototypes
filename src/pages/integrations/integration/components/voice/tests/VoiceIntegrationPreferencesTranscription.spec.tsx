import React from 'react'
import {fireEvent, render, RenderResult} from '@testing-library/react'
import {PhoneRingingBehaviour} from 'models/integration/types'
import VoiceIntegrationPreferencesTranscription from '../VoiceIntegrationPreferencesTranscription'

describe('<VoiceIntegrationPreferencesTranscription />', () => {
    const handleChange = jest.fn()

    const defaultPreferences = {
        ringing_behaviour: PhoneRingingBehaviour.RoundRobin,
        record_inbound_calls: true,
        record_outbound_calls: true,
        voicemail_outside_business_hours: true,
    }

    const renderComponent = (preferences = {}): RenderResult => {
        return render(
            <VoiceIntegrationPreferencesTranscription
                preferences={{
                    ...defaultPreferences,
                    ...preferences,
                }}
                onPreferencesChange={handleChange}
            />
        )
    }

    it('should render transcription preferences', () => {
        const {getByText, getByLabelText} = renderComponent()

        expect(getByText('Transcription')).toBeInTheDocument()
        expect(
            getByText(
                'Use speech-to-text to transcribe all recorded calls and/or voicemails'
            )
        ).toBeInTheDocument()
        expect(getByLabelText('Call recording transcription')).not.toBeChecked()
        expect(getByLabelText('Voicemail transcription')).not.toBeChecked()
    })

    it('should render enabled transcription preferences', () => {
        const {getByLabelText} = renderComponent({
            transcribe: {
                voicemails: true,
                recordings: true,
            },
        })

        expect(getByLabelText('Call recording transcription')).toBeChecked()
        expect(getByLabelText('Voicemail transcription')).toBeChecked()
    })

    it('should render handle preferences changes', () => {
        const {getByLabelText} = renderComponent()

        fireEvent.click(getByLabelText('Call recording transcription'))
        fireEvent.click(getByLabelText('Voicemail transcription'))

        expect(handleChange.mock.calls).toHaveLength(2)
    })
})
