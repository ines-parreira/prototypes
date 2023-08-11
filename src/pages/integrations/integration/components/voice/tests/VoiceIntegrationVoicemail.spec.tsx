import React from 'react'
import {fromJS} from 'immutable'
import {fireEvent, render} from '@testing-library/react'
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
import * as accountFixtures from 'fixtures/account'
import {RootState, StoreDispatch} from 'state/types'
import * as api from 'pages/integrations/integration/components/phone/actions'

import VoiceIntegrationVoicemail from '../VoiceIntegrationVoicemail'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
jest.mock('models/api/resources')
const updatePhoneVoicemailConfigurationSpy = jest.spyOn(
    api,
    'updatePhoneVoicemailConfiguration'
)

const ivrIntegration: PhoneIntegration = {
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
const standardIntegration: PhoneIntegration = {
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
        function: PhoneFunction.Standard,
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

const renderVoiceIntegrationVoicemail = (
    storeState: RootState,
    integration: PhoneIntegration
) =>
    render(
        <Provider store={mockStore(storeState)}>
            <VoiceIntegrationVoicemail integration={integration} />
        </Provider>
    )

describe('<VoiceIntegrationVoicemail /> feature flag check', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        resetLDMocks()
    })
    ;[standardIntegration, ivrIntegration].forEach((integration) => {
        it('should render old UI', () => {
            mockFlags({
                [FeatureFlagKey.CustomVoicemailOutsideBusinessHours]: false,
            })
            const {getByLabelText, getByText} = renderVoiceIntegrationVoicemail(
                {} as RootState,
                integration
            )
            expect(getByText('Set Voicemail')).toBeInTheDocument()
            expect(getByText('Insert Voice Recording')).toBeInTheDocument()
            expect(getByText('Text To Speech')).toBeInTheDocument()
            expect(getByText('None')).toBeInTheDocument()
            expect(getByLabelText('None')).toBeChecked()
            expect(
                getByText('Allow caller to leave voicemail')
            ).toBeInTheDocument()
        })
    })

    it('should render IVR integration (custom voicemail outside business hours)', () => {
        mockFlags({
            [FeatureFlagKey.CustomVoicemailOutsideBusinessHours]: true,
        })
        const {getByLabelText, getByText} = renderVoiceIntegrationVoicemail(
            {} as RootState,
            ivrIntegration
        )

        expect(getByText('Voice recording')).toBeInTheDocument()
        expect(getByText('Text-to-speech')).toBeInTheDocument()
        expect(getByText('None')).toBeInTheDocument()
        expect(getByLabelText('None')).toBeChecked()

        expect(getByText('Allow caller to leave voicemail')).toBeInTheDocument()
        expect(
            getByText(
                'When disabled, the voicemail recording will play but the caller will not be able to leave a message.'
            )
        ).toBeInTheDocument()
    })

    it('should render standard integration (custom voicemail outside business hours)', () => {
        mockFlags({
            [FeatureFlagKey.CustomVoicemailOutsideBusinessHours]: true,
        })
        const {getByLabelText, getByText} = renderVoiceIntegrationVoicemail(
            {} as RootState,
            standardIntegration
        )
        expect(getByText('During business hours')).toBeInTheDocument()
        expect(getByText('Voice recording')).toBeInTheDocument()
        expect(getByText('Text-to-speech')).toBeInTheDocument()
        expect(getByText('None')).toBeInTheDocument()
        expect(getByLabelText('None')).toBeChecked()

        expect(getByText('Outside business hours')).toBeInTheDocument()
        expect(getByText('Set Business Hours')).toBeInTheDocument()
        expect(
            getByLabelText('Use same voicemail as during business hours')
        ).toBeDisabled()

        expect(getByText('Allow caller to leave voicemail')).toBeInTheDocument()
        expect(
            getByText(
                'When disabled, the voicemail recording will play but the caller will not be able to leave a message.'
            )
        ).toBeInTheDocument()
    })
})

describe('<VoiceIntegrationVoicemail /> outside business hours', () => {
    const defaultStoreState = {
        currentAccount: fromJS({
            ...accountFixtures.account,
            settings: [
                {
                    data: {
                        business_hours: [
                            {
                                days: '1,2,3,4,5',
                                from_time: '09:00',
                                to_time: '17:00',
                            },
                        ],
                        timezone: 'Europe/Bucharest',
                    },
                    id: 1,
                    type: 'business-hours',
                },
            ],
        }),
    } as RootState

    beforeEach(() => {
        jest.resetAllMocks()
        resetLDMocks()
        mockFlags({
            [FeatureFlagKey.CustomVoicemailOutsideBusinessHours]: true,
        })
    })

    it('should render without set business hours', () => {
        const {queryByText} = renderVoiceIntegrationVoicemail(
            defaultStoreState,
            standardIntegration
        )
        expect(queryByText('Set Business Hours')).toBeNull()
    })

    it('should render same settings', () => {
        const standardIntegrationWithDifferentSettings: PhoneIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                voicemail: {
                    ...standardIntegration.meta.voicemail,
                    outside_business_hours: {
                        use_during_business_hours_settings: true,
                        voice_message_type: VoiceMessageType.TextToSpeech,
                        text_to_speech_content: 'We are outside business hours',
                    },
                },
            },
        }
        const {getByLabelText, queryByText} = renderVoiceIntegrationVoicemail(
            defaultStoreState,
            standardIntegrationWithDifferentSettings
        )
        expect(
            getByLabelText('Use same voicemail as during business hours')
        ).toBeChecked()
        expect(queryByText('We are outside business hours')).toBeNull()
    })

    it('can switch to different outside business hours settings', () => {
        const standardIntegrationWithDifferentSettings: PhoneIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                voicemail: {
                    ...standardIntegration.meta.voicemail,
                    outside_business_hours: {
                        use_during_business_hours_settings: true,
                        voice_message_type: VoiceMessageType.TextToSpeech,
                        text_to_speech_content: 'We are outside business hours',
                    },
                },
            },
        }
        const {queryByText, getByLabelText} = renderVoiceIntegrationVoicemail(
            defaultStoreState,
            standardIntegrationWithDifferentSettings
        )
        fireEvent.click(
            getByLabelText('Use same voicemail as during business hours')
        )
        expect(
            getByLabelText('Use same voicemail as during business hours')
        ).not.toBeChecked()
        expect(queryByText('We are outside business hours')).toBeInTheDocument()
    })

    it('should render different settings', () => {
        const standardIntegrationWithDifferentSettings: PhoneIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                voicemail: {
                    ...standardIntegration.meta.voicemail,
                    outside_business_hours: {
                        use_during_business_hours_settings: false,
                        voice_message_type: VoiceMessageType.TextToSpeech,
                        text_to_speech_content: 'We are outside business hours',
                    },
                },
            },
        }

        const {getByLabelText, getByText} = renderVoiceIntegrationVoicemail(
            defaultStoreState,
            standardIntegrationWithDifferentSettings
        )
        expect(
            getByLabelText('Use same voicemail as during business hours')
        ).not.toBeChecked()
        expect(getByText('We are outside business hours')).toBeInTheDocument()
    })

    it('should allow choosing different settings', () => {
        const standardIntegrationWithDifferentSettings: PhoneIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                voicemail: {
                    allow_to_leave_voicemail: true,
                    voice_message_type: VoiceMessageType.TextToSpeech,
                    text_to_speech_content: 'We are during business hours',
                    outside_business_hours: {
                        use_during_business_hours_settings: false,
                        voice_message_type: VoiceMessageType.TextToSpeech,
                        text_to_speech_content: 'We are outside business hours',
                    },
                },
            },
        }

        const {getByLabelText, queryByText, getByText, getAllByLabelText} =
            render(
                <Provider store={mockStore(defaultStoreState)}>
                    <VoiceIntegrationVoicemail
                        integration={standardIntegrationWithDifferentSettings}
                    />
                </Provider>
            )
        expect(
            getByLabelText('Use same voicemail as during business hours')
        ).not.toBeChecked()
        expect(getByText('We are outside business hours')).toBeInTheDocument()

        const noneRadioButtons = getAllByLabelText('None')
        expect(noneRadioButtons).toHaveLength(2)

        const duringBusinessHoursNoneButton = noneRadioButtons[0]
        const outsideBusinessHoursNoneButton = noneRadioButtons[1]

        fireEvent.click(outsideBusinessHoursNoneButton)

        expect(queryByText('We are outside business hours')).toBeNull()
        expect(outsideBusinessHoursNoneButton).toBeChecked()
        expect(duringBusinessHoursNoneButton).not.toBeChecked()
        expect(getByText('We are during business hours')).toBeInTheDocument()
    })

    it('should allow removing a voice recording', () => {
        const standardIntegrationWithDifferentSettings: PhoneIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                voicemail: {
                    allow_to_leave_voicemail: true,
                    voice_message_type: VoiceMessageType.TextToSpeech,
                    text_to_speech_content: 'We are during business hours',
                    outside_business_hours: {
                        use_during_business_hours_settings: false,
                        voice_message_type: VoiceMessageType.VoiceRecording,
                        voice_recording_file_path: 'test',
                    },
                },
            },
        }

        const {getByRole, queryByLabelText, queryByRole} =
            renderVoiceIntegrationVoicemail(
                defaultStoreState,
                standardIntegrationWithDifferentSettings
            )
        expect(queryByLabelText('voice-recording')).toBeInTheDocument()
        expect(getByRole('button', {name: 'delete'})).toBeInTheDocument()
        expect(queryByRole('button', {name: 'backup Select file'})).toBeNull()

        fireEvent.click(getByRole('button', {name: 'delete'}))
        expect(queryByLabelText('voice-recording')).toBeNull()
        expect(
            getByRole('button', {name: 'backup Select file'})
        ).toBeInTheDocument()

        fireEvent.click(getByRole('button', {name: 'Save changes'}))
        expect(updatePhoneVoicemailConfigurationSpy.mock.calls).toEqual([])
    })
})
