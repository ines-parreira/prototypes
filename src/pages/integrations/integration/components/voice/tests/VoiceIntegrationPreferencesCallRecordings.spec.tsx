import {fireEvent, render, RenderResult} from '@testing-library/react'
import React from 'react'

import {PhoneRingingBehaviour} from 'models/integration/types'

import VoiceIntegrationPreferencesCallRecordings from '../VoiceIntegrationPreferencesCallRecordings'

describe('<VoiceIntegrationPreferencesCallRecordings />', () => {
    const handleChange = jest.fn()

    const defaultPreferences = {
        ringing_behaviour: PhoneRingingBehaviour.RoundRobin,
        record_inbound_calls: true,
        record_outbound_calls: true,
        voicemail_outside_business_hours: true,
    }

    const renderComponent = (preferences = {}): RenderResult => {
        return render(
            <VoiceIntegrationPreferencesCallRecordings
                preferences={{
                    ...defaultPreferences,
                    ...preferences,
                }}
                onPreferencesChange={handleChange}
            />
        )
    }

    it('should render call recording preferences', () => {
        const {getByText, getAllByLabelText} = renderComponent()

        expect(getByText('Call Recording')).toBeInTheDocument()
        expect(
            getByText('Automatically record and store all customer calls')
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
})
