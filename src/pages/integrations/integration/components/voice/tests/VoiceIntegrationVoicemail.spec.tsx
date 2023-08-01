import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    IntegrationType,
    PhoneIntegration,
    PhoneRingingBehaviour,
    VoiceMessageType,
} from 'models/integration/types'
import {PhoneCountry, PhoneFunction} from 'business/twilio'

import VoiceIntegrationVoicemail from '../VoiceIntegrationVoicemail'

const mockStore = configureMockStore([thunk])()

describe('<VoiceIntegrationVoicemail />', () => {
    const integration: PhoneIntegration = {
        id: 1,
        name: 'My Phone Integration',
        decoration: null,
        description: '',
        mappings: null,
        uri: '',
        created_datetime: '1970-01-01T18:00:00',
        updated_datetime: '1970-01-01T18:00:00',
        deactivated_datetime: null,
        deleted_datetime: null,
        locked_datetime: null,
        user: {
            id: 1,
        },
        type: IntegrationType.Phone,
        meta: {
            type: '',
            emoji: '☎️',
            area_code: '880',
            function: PhoneFunction.Ivr,
            country: PhoneCountry.US,
            phone_number_id: 1,
            preferences: {
                record_inbound_calls: false,
                record_outbound_calls: false,
                voicemail_outside_business_hours: false,
                ringing_behaviour: PhoneRingingBehaviour.RoundRobin,
            },
            greeting_message: {
                voice_message_type: VoiceMessageType.None,
            },
            voicemail: {
                voice_message_type: VoiceMessageType.None,
                allow_to_leave_voicemail: true,
            },
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()
        resetLDMocks()
    })

    it('should render IVR integration', () => {
        mockFlags({
            [FeatureFlagKey.CustomVoicemailOutsideBusinessHours]: false,
        })
        const {getByLabelText, getByText} = render(
            <Provider store={mockStore}>
                <VoiceIntegrationVoicemail integration={integration} />
            </Provider>
        )
        expect(getByText('Insert Voice Recording')).toBeInTheDocument()
        expect(getByText('Text To Speech')).toBeInTheDocument()
        expect(getByText('None')).toBeInTheDocument()
        expect(getByLabelText('None')).toBeChecked()
        expect(getByText('Allow caller to leave voicemail')).toBeInTheDocument()
    })

    it('should render IVR integration (custom voicemail outside business hours)', () => {
        mockFlags({
            [FeatureFlagKey.CustomVoicemailOutsideBusinessHours]: true,
        })
        const {getByLabelText, getByText} = render(
            <Provider store={mockStore}>
                <VoiceIntegrationVoicemail integration={integration} />
            </Provider>
        )
        expect(getByText('Voice recording')).toBeInTheDocument()
        expect(getByText('Text-to-speech')).toBeInTheDocument()
        expect(getByText('None')).toBeInTheDocument()
        expect(getByLabelText('None')).toBeChecked()
        expect(getByText('Allow caller to leave voicemail')).toBeInTheDocument()
        expect(
            getByText(
                'For IVR numbers, voicemail is only available outside business hours.'
            )
        ).toBeInTheDocument()
        expect(
            getByText(
                'When disabled, the voicemail recording will play but the caller will not be able to leave a message.'
            )
        ).toBeInTheDocument()
    })
})
