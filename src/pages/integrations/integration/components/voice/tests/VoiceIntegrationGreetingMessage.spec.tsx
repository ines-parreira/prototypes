import {WaitMusicType} from '@gorgias/api-client'
import {fireEvent} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {PhoneCountry, PhoneFunction} from 'business/twilio'
import {FeatureFlagKey} from 'config/featureFlags'
import {phoneNumbers} from 'fixtures/newPhoneNumber'
import {
    IntegrationType,
    PhoneIntegration,
    PhoneRingingBehaviour,
    VoiceMessageType,
} from 'models/integration/types'
import {Account} from 'state/currentAccount/types'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock, renderWithRouter} from 'utils/testing'

import useVoiceIntegrationGreetingMessage from '../hooks/useVoiceIntegrationGreetingMessage'
import VoiceIntegrationGreetingMessage from '../VoiceIntegrationGreetingMessage'
import {STATIC_WAIT_MUSIC_LIBRARY} from '../waitMusicLibraryConstants'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const store = mockStore({
    entities: {
        newPhoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({...acc, [number.id]: number}),
            {}
        ),
    },
} as RootState)

jest.mock(
    'pages/integrations/integration/components/voice/hooks/useVoiceIntegrationGreetingMessage'
)
const defaultUseVoiceIntegrationGreetingMessage = {
    greetingMessagePayload: {
        voice_message_type: VoiceMessageType.None,
        text_to_speech_content: 'Hello!',
    },
    setGreetingMessagePayload: jest.fn(),
    waitMusicPayload: {
        type: WaitMusicType.Library,
    },
    setWaitMusicPayload: jest.fn(),
    isGreetingMessageLoading: false,
    isWaitMusicLoading: false,
    isSubmittable: false,
    makeApiCalls: jest.fn(),
}
assumeMock(useVoiceIntegrationGreetingMessage).mockReturnValue(
    defaultUseVoiceIntegrationGreetingMessage
)

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

const renderVoiceIntegrationGreetingMessage = (integration: PhoneIntegration) =>
    renderWithRouter(
        <Provider store={store}>
            <VoiceIntegrationGreetingMessage integration={integration} />
        </Provider>
    )

describe('<VoiceIntegrationGreetingMessage /> render', () => {
    it('should render standard integration', () => {
        mockFlags({
            [FeatureFlagKey.CustomWaitMusic]: true,
        })

        const {getByLabelText, queryByText, getByRole, getAllByText} =
            renderVoiceIntegrationGreetingMessage(standardIntegration)
        expect(queryByText('Set greeting message')).toBeInTheDocument()
        expect(queryByText('Text To Speech')).toBeInTheDocument()
        const customRecordingFields = getAllByText('Custom recording')
        expect(customRecordingFields.length).toBe(2)
        expect(customRecordingFields[0]).toBeInTheDocument()
        expect(queryByText('None')).toBeInTheDocument()
        expect(getByLabelText('None')).toBeChecked()

        expect(queryByText('Wait music')).toBeInTheDocument()
        expect(queryByText('Choose from library')).toBeInTheDocument()
        expect(customRecordingFields[1]).toBeInTheDocument()
        expect(getByLabelText('Choose from library')).toBeChecked()

        expect(getByRole('button', {name: 'Save changes'})).toBeAriaDisabled()
    })

    it('should not render wait music section when FF disabled', () => {
        mockFlags({
            [FeatureFlagKey.CustomWaitMusic]: false,
        })

        const {getByRole, queryByText} =
            renderVoiceIntegrationGreetingMessage(standardIntegration)

        expect(queryByText('Set greeting message')).toBeInTheDocument()
        expect(queryByText('Wait music')).not.toBeInTheDocument()

        expect(getByRole('button', {name: 'Save changes'})).toBeAriaDisabled()
    })
})

describe('<VoiceIntegrationGreetingMessage /> greeting message', () => {
    beforeEach(() => {
        window.GORGIAS_STATE.currentAccount = {
            domain: 'acme',
        } as Account
    })

    it('should allow changing between different greeting message types', () => {
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

        const setGreetingMessagePayloadMock = jest.fn()
        assumeMock(useVoiceIntegrationGreetingMessage).mockReturnValue({
            ...defaultUseVoiceIntegrationGreetingMessage,
            greetingMessagePayload: {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Welcome to Acme Inc.!',
            },
            setGreetingMessagePayload: setGreetingMessagePayloadMock,
            isSubmittable: false,
        })

        const {getByLabelText, getByRole} =
            renderVoiceIntegrationGreetingMessage(
                standardIntegrationWithDifferentSettings
            )

        expect(getByLabelText('Text To Speech')).toBeChecked()
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaDisabled()

        fireEvent.click(getByLabelText('None'))
        expect(setGreetingMessagePayloadMock).toHaveBeenCalledWith({
            voice_message_type: VoiceMessageType.None,
            text_to_speech_content: 'Welcome to Acme Inc.!',
        })
    })

    it('should save greeting messages preferences', () => {
        const standardIntegrationWithDifferentSettings: PhoneIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                greeting_message: {
                    voice_message_type: VoiceMessageType.None,
                },
            },
        }

        const makeApiCallsMock = jest.fn()
        assumeMock(useVoiceIntegrationGreetingMessage).mockReturnValue({
            ...defaultUseVoiceIntegrationGreetingMessage,
            greetingMessagePayload: {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Welcome to Acme Inc.!',
            },
            isSubmittable: true,
            makeApiCalls: makeApiCallsMock,
        })

        const {getByLabelText, getByRole} =
            renderVoiceIntegrationGreetingMessage(
                standardIntegrationWithDifferentSettings
            )

        expect(getByLabelText('Text To Speech')).toBeChecked()
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaEnabled()

        fireEvent.click(getByRole('button', {name: 'Save changes'}))
        expect(makeApiCallsMock).toHaveBeenCalledWith()
    })
})

describe('<VoiceIntegrationGreetingMessage /> wait music', () => {
    const LIBRARY_EXAMPLE = STATIC_WAIT_MUSIC_LIBRARY[1]
    const CUSTOM_RECORDING_EXAMPLE = {
        audio_file_name: 'cool-rock-riffs.mp3',
        audio_file_path: 'https://uploads.gorgias.io/phone/CoolRockRiffs.mp3',
        audio_file_type: 'audio/mpeg',
    }

    beforeEach(() => {
        window.GORGIAS_STATE.currentAccount = {
            domain: 'acme',
        } as Account
        window.URL.createObjectURL = jest.fn().mockReturnValue('fake-url')
        mockFlags({
            [FeatureFlagKey.CustomWaitMusic]: true,
        })
    })

    it('should allow changing between different wait music types', () => {
        const standardIntegrationWithDifferentSettings: PhoneIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                wait_music: {
                    type: WaitMusicType.CustomRecording,
                    library: LIBRARY_EXAMPLE,
                    custom_recording: CUSTOM_RECORDING_EXAMPLE,
                },
            },
        }

        const setWaitMusicPayloadMock = jest.fn()
        assumeMock(useVoiceIntegrationGreetingMessage).mockReturnValue({
            ...defaultUseVoiceIntegrationGreetingMessage,
            waitMusicPayload: {
                type: WaitMusicType.CustomRecording,
                library: LIBRARY_EXAMPLE,
                custom_recording: CUSTOM_RECORDING_EXAMPLE,
            },
            setWaitMusicPayload: setWaitMusicPayloadMock,
            isSubmittable: false,
        })

        const {getByLabelText, getByRole, getAllByLabelText} =
            renderVoiceIntegrationGreetingMessage(
                standardIntegrationWithDifferentSettings
            )

        expect(getAllByLabelText('Custom recording')[1]).toBeChecked()
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaDisabled()

        fireEvent.click(getByLabelText('Choose from library'))

        expect(setWaitMusicPayloadMock).toHaveBeenCalledWith({
            type: WaitMusicType.Library,
            library: LIBRARY_EXAMPLE,
            custom_recording: CUSTOM_RECORDING_EXAMPLE,
        })
    })

    it('should save wait music preferences', () => {
        const standardIntegrationWithDifferentSettings: PhoneIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                wait_music: {
                    type: WaitMusicType.CustomRecording,
                    custom_recording: CUSTOM_RECORDING_EXAMPLE,
                },
            },
        }

        const makeApiCallsMock = jest.fn()
        assumeMock(useVoiceIntegrationGreetingMessage).mockReturnValue({
            ...defaultUseVoiceIntegrationGreetingMessage,
            waitMusicPayload: {
                type: WaitMusicType.Library,
                library: LIBRARY_EXAMPLE,
            },
            isSubmittable: true,
            makeApiCalls: makeApiCallsMock,
        })

        const {getByLabelText, getByRole} =
            renderVoiceIntegrationGreetingMessage(
                standardIntegrationWithDifferentSettings
            )

        expect(getByLabelText('Choose from library')).toBeChecked()
        expect(getByRole('button', {name: 'Save changes'})).toBeAriaEnabled()

        fireEvent.click(getByRole('button', {name: 'Save changes'}))
        expect(makeApiCallsMock).toHaveBeenCalledWith()
    })

    it('should pass the correct integrationCountry to WaitMusicField', () => {
        const standardIntegrationWithExistingWaitMusicPreferences: PhoneIntegration =
            {
                ...standardIntegration,
                meta: {
                    ...standardIntegration.meta,
                    phone_number_id: 3,
                    wait_music: {
                        type: WaitMusicType.Library,
                        library: LIBRARY_EXAMPLE,
                    },
                },
            }

        const setWaitMusicPayloadMock = jest.fn()
        assumeMock(useVoiceIntegrationGreetingMessage).mockReturnValue({
            ...defaultUseVoiceIntegrationGreetingMessage,
            waitMusicPayload: {
                type: WaitMusicType.Library,
                library: LIBRARY_EXAMPLE,
            },
            setWaitMusicPayload: setWaitMusicPayloadMock,
            isSubmittable: false,
        })

        const {getByLabelText, getByText} =
            renderVoiceIntegrationGreetingMessage(
                standardIntegrationWithExistingWaitMusicPreferences
            )

        expect(getByLabelText('Choose from library')).toBeChecked()

        fireEvent.click(getByText('arrow_drop_down'))
        fireEvent.click(getByText('Ringtone'))

        expect(setWaitMusicPayloadMock).toHaveBeenCalledWith({
            type: WaitMusicType.Library,
            library: {
                key: 'ringtone',
                name: 'Ringtone',
                audio_file_path:
                    'https://github.com/msilvestro/custom-wait-music/raw/refs/heads/main/Australia_ringing_tone.mp3',
            },
        })
    })
})
