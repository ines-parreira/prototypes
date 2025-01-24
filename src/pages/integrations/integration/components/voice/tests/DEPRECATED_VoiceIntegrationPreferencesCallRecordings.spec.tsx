import {fireEvent, render, RenderResult} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {PhoneRingingBehaviour, VoiceMessageType} from 'models/integration/types'

import {assumeMock} from 'utils/testing'

import DEPRECATED_VoiceIntegrationPreferencesCallRecordings from '../DEPRECATED_VoiceIntegrationPreferencesCallRecordings'
import VoiceMessageField from '../VoiceMessageField'

jest.mock('pages/integrations/integration/components/voice/VoiceMessageField')

const VoiceMessageFieldMock = assumeMock(VoiceMessageField)

describe('<DEPRECATED_VoiceIntegrationPreferencesCallRecordings />', () => {
    const handleChange = jest.fn()

    const defaultPreferences = {
        ringing_behaviour: PhoneRingingBehaviour.RoundRobin,
        record_inbound_calls: true,
        record_outbound_calls: true,
        voicemail_outside_business_hours: true,
    }

    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.CustomRecordingNotification]: true,
        })
        VoiceMessageFieldMock.mockReturnValue(<div>VoiceMessageField</div>)
    })

    const renderComponent = (preferences = {}): RenderResult => {
        return render(
            <DEPRECATED_VoiceIntegrationPreferencesCallRecordings
                preferences={{
                    ...defaultPreferences,
                    ...preferences,
                }}
                onPreferencesChange={handleChange}
                recordingNotification={{
                    voice_message_type: VoiceMessageType.TextToSpeech,
                    text_to_speech_content: 'test',
                }}
                onRecordingNotificationChange={jest.fn()}
            />
        )
    }

    it('should render call recording preferences', () => {
        const {getByText, getAllByLabelText} = renderComponent()

        expect(getByText('Call Recording')).toBeInTheDocument()
        expect(
            getByText('Automatically record and store all customer calls.')
        ).toBeInTheDocument()
        expect(getByText('Inbound calls')).toBeInTheDocument()
        expect(getByText('Outbound calls')).toBeInTheDocument()

        const callToggles = getAllByLabelText('Start recording automatically')
        expect(callToggles[0]).toBeChecked()
        expect(callToggles[1]).toBeChecked()
    })

    it('should render enabled transcription preferences', () => {
        const {getAllByLabelText} = renderComponent({
            record_inbound_calls: false,
            record_outbound_calls: false,
        })

        const callToggles = getAllByLabelText('Start recording automatically')
        expect(callToggles[0]).not.toBeChecked()
        expect(callToggles[1]).not.toBeChecked()
    })

    it('should render handle preferences changes', () => {
        const {getAllByLabelText} = renderComponent()

        const callToggles = getAllByLabelText('Start recording automatically')
        fireEvent.click(callToggles[0])
        fireEvent.click(callToggles[1])

        expect(handleChange.mock.calls).toHaveLength(2)
    })

    describe('recording notification settings', () => {
        it('should not render recording notification settings when FF is off', () => {
            mockFlags({
                [FeatureFlagKey.CustomRecordingNotification]: false,
            })

            const {queryByText} = renderComponent({
                record_inbound_calls: true,
                record_outbound_calls: true,
            })

            expect(
                queryByText('Call recording notifications')
            ).not.toBeInTheDocument()
            expect(queryByText('VoiceMessageField')).not.toBeInTheDocument()
        })

        it('should render recording notification settings', () => {
            const {getByText} = renderComponent({
                record_inbound_calls: true,
                record_outbound_calls: true,
            })

            expect(
                getByText('Call recording notifications')
            ).toBeInTheDocument()
            expect(getByText('VoiceMessageField')).toBeInTheDocument()
        })

        it('should disable recording notification settings when both call recording settings are disabled', () => {
            const {getByText} = renderComponent({
                record_inbound_calls: false,
                record_outbound_calls: false,
            })

            expect(
                getByText('Call recording notifications')
            ).toBeInTheDocument()
            expect(VoiceMessageFieldMock).toHaveBeenCalledWith(
                expect.objectContaining({isDisabled: true}),
                {}
            )
        })
    })
})
