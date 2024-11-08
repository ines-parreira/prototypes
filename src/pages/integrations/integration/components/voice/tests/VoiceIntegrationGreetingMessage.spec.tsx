import {fireEvent, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {PhoneCountry, PhoneFunction} from 'business/twilio'
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

import VoiceIntegrationGreetingMessage from '../VoiceIntegrationGreetingMessage'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
jest.mock('models/api/resources')
const updatePhoneGreetingMessageConfigurationSpy = jest.spyOn(
    api,
    'updatePhoneGreetingMessageConfiguration'
)
const fetchIntegratonsSpy = jest.spyOn(actions, 'fetchIntegrations')

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

const renderVoiceIntegrationGreetingMessage = (
    storeState: RootState,
    integration: PhoneIntegration
) =>
    renderWithRouter(
        <Provider store={mockStore(storeState)}>
            <VoiceIntegrationGreetingMessage integration={integration} />
        </Provider>
    )

describe('<VoiceIntegrationGreetingMessage /> render', () => {
    it('should render standard integration', () => {
        const {getByLabelText, getByText, getByRole} =
            renderVoiceIntegrationGreetingMessage(
                {} as RootState,
                standardIntegration
            )
        expect(getByText('Set greeting message')).toBeInTheDocument()
        expect(getByText('Text To Speech')).toBeInTheDocument()
        expect(getByText('Custom recording')).toBeInTheDocument()
        expect(getByText('None')).toBeInTheDocument()
        expect(getByLabelText('None')).toBeChecked()

        expect(getByRole('button', {name: 'Save changes'})).toBeAriaDisabled()
    })
})

describe('<VoiceIntegrationGreetingMessage /> greeting message', () => {
    beforeEach(() => {
        window.GORGIAS_STATE.currentAccount = {
            domain: 'acme',
        } as Account
    })

    it('should allow saving when switching to different settings', async () => {
        const standardIntegrationWithDifferentSettings: PhoneIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                greeting_message: {
                    voice_message_type: VoiceMessageType.TextToSpeech,
                    text_to_speech_content: 'Welcome to Acme Inc.!',
                },
            },
        }
        updatePhoneGreetingMessageConfigurationSpy.mockReturnValue(() => {
            return new Promise((resolve) =>
                resolve({
                    payload: {},
                })
            )
        })
        fetchIntegratonsSpy.mockReturnValue(() => Promise.resolve(null))

        const {getByLabelText, getByRole} =
            renderVoiceIntegrationGreetingMessage(
                {} as RootState,
                standardIntegrationWithDifferentSettings
            )

        expect(getByLabelText('Text To Speech')).toBeChecked()
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaDisabled()

        fireEvent.click(getByLabelText('None'))
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaEnabled()

        fireEvent.click(getByRole('button', {name: 'Save changes'}))
        expect(
            updatePhoneGreetingMessageConfigurationSpy.mock.calls
        ).toHaveLength(1)
        await waitFor(() =>
            expect(fetchIntegratonsSpy.mock.calls).toHaveLength(1)
        )
    })

    it('should disable saving when going back to the original settings', () => {
        const standardIntegrationWithDifferentSettings: PhoneIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                greeting_message: {
                    voice_message_type: VoiceMessageType.None,
                },
            },
        }

        const {getByLabelText, getByRole} =
            renderVoiceIntegrationGreetingMessage(
                {} as RootState,
                standardIntegrationWithDifferentSettings
            )

        expect(getByLabelText('None')).toBeChecked()
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaDisabled()

        fireEvent.click(getByLabelText('Text To Speech'))
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaEnabled()

        fireEvent.click(getByLabelText('None'))
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaDisabled()
    })

    it('should disable saving when going back to the original text-to-speech text', async () => {
        const standardIntegrationWithDifferentSettings: PhoneIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                greeting_message: {
                    voice_message_type: VoiceMessageType.TextToSpeech,
                    text_to_speech_content: 'Welcome to Acme Inc.!',
                },
            },
        }

        const {getByLabelText, getByRole, getByText} =
            renderVoiceIntegrationGreetingMessage(
                {} as RootState,
                standardIntegrationWithDifferentSettings
            )

        expect(getByLabelText('Text To Speech')).toBeChecked()
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaDisabled()

        const textToSpeechInputBox = getByText('Welcome to Acme Inc.!')
        await userEvent.type(textToSpeechInputBox, ' Hello!')
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaEnabled()

        userEvent.clear(textToSpeechInputBox)
        await userEvent.type(textToSpeechInputBox, 'Welcome to Acme Inc.!')
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaDisabled()
    })

    it('should allow replacing a custom recording', () => {
        const standardIntegrationWithDifferentSettings: PhoneIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                greeting_message: {
                    voice_message_type: VoiceMessageType.VoiceRecording,
                    voice_recording_file_path: 'example.mp3',
                },
            },
        }

        const {getByLabelText, getByRole} =
            renderVoiceIntegrationGreetingMessage(
                {} as RootState,
                standardIntegrationWithDifferentSettings
            )
        expect(getByLabelText('voice-recording')).toBeInTheDocument()
        expect(
            getByRole('button', {name: 'backup Replace File'})
        ).toBeInTheDocument()
    })

    it('should not allow saving without a recording file', () => {
        const standardIntegrationWithDifferentSettings: PhoneIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                greeting_message: {
                    voice_message_type: VoiceMessageType.VoiceRecording,
                    voice_recording_file_path: '',
                },
            },
        }

        const {getByRole} = renderVoiceIntegrationGreetingMessage(
            {} as RootState,
            standardIntegrationWithDifferentSettings
        )
        fireEvent.click(getByRole('button', {name: 'Save changes'}))
        expect(updatePhoneGreetingMessageConfigurationSpy.mock.calls).toEqual(
            []
        )
    })
})
