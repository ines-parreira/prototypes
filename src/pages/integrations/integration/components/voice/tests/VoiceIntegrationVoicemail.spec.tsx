import {fireEvent, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {PhoneCountry, PhoneFunction} from 'business/twilio'
import * as accountFixtures from 'fixtures/account'
import {
    IntegrationType,
    PhoneIntegration,
    PhoneRingingBehaviour,
    VoiceMessageType,
} from 'models/integration/types'
import * as api from 'pages/integrations/integration/components/phone/actions'
import {Account} from 'state/currentAccount/types'
import * as actions from 'state/integrations/actions'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'

import VoiceIntegrationVoicemail from '../VoiceIntegrationVoicemail'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
jest.mock('models/api/resources')
const updatePhoneVoicemailConfigurationSpy = jest.spyOn(
    api,
    'updatePhoneVoicemailConfiguration'
)
const fetchIntegratonsSpy = jest.spyOn(actions, 'fetchIntegrations')

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
    managed: false,
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
    managed: false,
}

const renderVoiceIntegrationVoicemail = (
    storeState: RootState,
    integration: PhoneIntegration
) =>
    renderWithRouter(
        <Provider store={mockStore(storeState)}>
            <VoiceIntegrationVoicemail integration={integration} />
        </Provider>
    )

describe('<VoiceIntegrationVoicemail /> render', () => {
    it('should render IVR integration', () => {
        const {getByLabelText, getByText, getByRole} =
            renderVoiceIntegrationVoicemail({} as RootState, ivrIntegration)

        expect(getByText('Custom recording')).toBeInTheDocument()
        expect(getByText('Text To Speech')).toBeInTheDocument()
        expect(getByText('None')).toBeInTheDocument()
        expect(getByLabelText('None')).toBeChecked()

        expect(getByText('Allow caller to leave voicemail')).toBeInTheDocument()
        expect(
            getByText(
                'When unchecked, the voicemail recording will play but the caller will not be able to leave a message.'
            )
        ).toBeInTheDocument()
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaDisabled()
    })

    it('should render standard integration', () => {
        const {getByLabelText, getByText, getByRole} =
            renderVoiceIntegrationVoicemail(
                {} as RootState,
                standardIntegration
            )
        expect(getByText('During business hours')).toBeInTheDocument()
        expect(getByText('Custom recording')).toBeInTheDocument()
        expect(getByText('Text To Speech')).toBeInTheDocument()
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
                'When unchecked, the voicemail recording will play but the caller will not be able to leave a message.'
            )
        ).toBeInTheDocument()
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaDisabled()
    })
})

describe('<VoiceIntegrationVoicemail /> outside business hours', () => {
    beforeEach(() => {
        window.GORGIAS_STATE.currentAccount = {
            domain: 'acme',
        } as Account
    })

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

    it('should allow saving different settings', async () => {
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
        updatePhoneVoicemailConfigurationSpy.mockReturnValue(() => {
            return new Promise((resolve) =>
                resolve({
                    payload: {
                        message: 'Changes saved.',
                    },
                })
            )
        })
        fetchIntegratonsSpy.mockReturnValue(() => Promise.resolve(null))

        const {
            getByLabelText,
            queryByText,
            getByText,
            getAllByLabelText,
            getByRole,
        } = renderVoiceIntegrationVoicemail(
            defaultStoreState,
            standardIntegrationWithDifferentSettings
        )
        expect(
            getByLabelText('Use same voicemail as during business hours')
        ).not.toBeChecked()
        expect(getByText('We are outside business hours')).toBeInTheDocument()

        // check settings from API
        const noneRadioButtons = getAllByLabelText('None')
        expect(noneRadioButtons).toHaveLength(2)

        const duringBusinessHoursNoneButton = noneRadioButtons[0]
        const outsideBusinessHoursNoneButton = noneRadioButtons[1]
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaDisabled()

        // change outside business hours settings
        fireEvent.click(outsideBusinessHoursNoneButton)

        expect(queryByText('We are outside business hours')).toBeNull()
        expect(outsideBusinessHoursNoneButton).toBeChecked()
        expect(duringBusinessHoursNoneButton).not.toBeChecked()
        expect(getByText('We are during business hours')).toBeInTheDocument()
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaEnabled()

        // save changes
        fireEvent.click(getByRole('button', {name: 'Save changes'}))
        expect(updatePhoneVoicemailConfigurationSpy.mock.calls).toHaveLength(1)
        await waitFor(() =>
            expect(fetchIntegratonsSpy.mock.calls).toHaveLength(1)
        )
    })

    it('should disable saving the same settings', async () => {
        const standardIntegrationWithDifferentSettings: PhoneIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                voicemail: {
                    allow_to_leave_voicemail: true,
                    voice_message_type: VoiceMessageType.None,
                    outside_business_hours: {
                        use_during_business_hours_settings: false,
                        voice_message_type: VoiceMessageType.None,
                    },
                },
            },
        }

        const {getAllByLabelText, getByRole, getByPlaceholderText} =
            renderVoiceIntegrationVoicemail(
                defaultStoreState,
                standardIntegrationWithDifferentSettings
            )

        const textToSpeechButtons = getAllByLabelText('Text To Speech')
        expect(textToSpeechButtons).toHaveLength(2)
        const outsideBHTextToSpeechButton = textToSpeechButtons[1]

        const noneRadioButtons = getAllByLabelText('None')
        expect(noneRadioButtons).toHaveLength(2)
        const outsideBusinessHoursNoneButton = noneRadioButtons[1]

        // change to text to speech, change the text
        fireEvent.click(outsideBHTextToSpeechButton)
        await userEvent.type(
            getByPlaceholderText('Write a message to convert to speech'),
            'changed'
        )
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaEnabled()

        // switch back to the initial None option
        fireEvent.click(outsideBusinessHoursNoneButton)
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaDisabled()
    })

    it('should allow replacing a voice recording', () => {
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

        const {queryByLabelText, queryByRole} = renderVoiceIntegrationVoicemail(
            defaultStoreState,
            standardIntegrationWithDifferentSettings
        )
        expect(queryByLabelText('voice-recording')).toBeInTheDocument()
        expect(queryByRole('button', {name: 'backup Replace file'})).toBeNull()
    })

    it('should not allow saving without a recording file', () => {
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
                        voice_recording_file_path: '',
                    },
                },
            },
        }

        const {getByRole} = renderVoiceIntegrationVoicemail(
            defaultStoreState,
            standardIntegrationWithDifferentSettings
        )
        fireEvent.click(getByRole('button', {name: 'Save changes'}))
        expect(updatePhoneVoicemailConfigurationSpy.mock.calls).toEqual([])
    })
})
