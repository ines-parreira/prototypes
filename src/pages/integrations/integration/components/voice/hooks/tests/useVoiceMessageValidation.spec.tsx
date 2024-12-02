import {WaitMusicType} from '@gorgias/api-queries'
import {act, renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {IvrMenuActionType, VoiceMessageType} from 'models/integration/constants'
import {
    PhoneIntegrationIvrSettings,
    PhoneIntegrationVoicemailSettings,
    VoiceMessage,
    LocalWaitMusicPreferences,
} from 'models/integration/types'
import {RootState} from 'state/types'

import * as utils from '../../utils'
import useVoiceMessageValidation from '../useVoiceMessageValidation'

const mockStore = configureMockStore<RootState>([thunk])({} as RootState)
const getAudioFileDurationSpy = jest.spyOn(utils, 'getAudioFileDuration')

const wrapper = ({children}: {children: React.ReactNode}) => (
    <Provider store={mockStore}>{children}</Provider>
)

const voiceMessageWithNewAudioFile: VoiceMessage = {
    voice_message_type: VoiceMessageType.VoiceRecording,
    voice_recording_file_path: 'example.mp3',
    new_voice_recording_file: 'data:audio/mpeg;base64,SUQzBAAAAAAAf1',
    new_voice_recording_file_name: 'new_upload.mp3',
    new_voice_recording_file_type: 'audio/mpeg',
}
const baseVoiceMessage: VoiceMessage = {
    voice_message_type: VoiceMessageType.VoiceRecording,
    voice_recording_file_path: 'example.mp3',
}

describe('useVoiceMessageValidation().canPayloadBeSubmitted', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    const renderCanPayloadBeSubmittedHook = (
        payload: Maybe<PhoneIntegrationVoicemailSettings>
    ) =>
        renderHook(
            () => {
                const {canPayloadBeSubmitted} = useVoiceMessageValidation()
                return canPayloadBeSubmitted(payload)
            },
            {
                wrapper,
            }
        )

    it('canPayloadBeSubmitted message_type = None', () => {
        const payload: PhoneIntegrationVoicemailSettings = {
            voice_message_type: VoiceMessageType.None,
            allow_to_leave_voicemail: true,
        }

        const {result} = renderCanPayloadBeSubmittedHook(payload)
        expect(result.current).toBe(true)
    })

    it('canPayloadBeSubmitted checks message_type = VoiceRecording successful', () => {
        const payload: PhoneIntegrationVoicemailSettings = {
            voice_message_type: VoiceMessageType.VoiceRecording,
            voice_recording_file_path: 'test',
            allow_to_leave_voicemail: true,
        }

        const {result} = renderCanPayloadBeSubmittedHook(payload)

        expect(result.current).toBe(true)
    })

    it('canPayloadBeSubmitted checks voice message file failure', () => {
        const payload: PhoneIntegrationVoicemailSettings = {
            voice_message_type: VoiceMessageType.VoiceRecording,
            allow_to_leave_voicemail: true,
        }

        const {result} = renderCanPayloadBeSubmittedHook(payload)

        expect(result.current).toBe(false)
        const notification = mockStore.getActions()[0]
        expect(notification).toHaveProperty(
            'payload.message',
            'Cannot save. Upload a recording to use it as your voicemail.'
        )
    })

    it('canPayloadBeSubmitted checks text to speech field', () => {
        const payload: PhoneIntegrationVoicemailSettings = {
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: 'This is a message',
            allow_to_leave_voicemail: true,
        }

        const {result} = renderCanPayloadBeSubmittedHook(payload)

        expect(result.current).toBe(true)
    })

    it('canPayloadBeSubmitted checks text to speech field', () => {
        const payload: PhoneIntegrationVoicemailSettings = {
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: '',
            allow_to_leave_voicemail: true,
        }

        const {result} = renderCanPayloadBeSubmittedHook(payload)

        expect(result.current).toBe(false)
    })

    it('canPayloadBeSubmitted checks outside_business_hours', () => {
        const payload: PhoneIntegrationVoicemailSettings = {
            voice_message_type: VoiceMessageType.None,
            allow_to_leave_voicemail: true,
            outside_business_hours: {
                use_during_business_hours_settings: true,
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: '',
            },
        }

        const {result} = renderCanPayloadBeSubmittedHook(payload)

        expect(result.current).toBe(false)
    })

    it('canPayloadBeSubmitted checks outside_business_hours', () => {
        const payload: PhoneIntegrationVoicemailSettings = {
            voice_message_type: VoiceMessageType.None,
            allow_to_leave_voicemail: true,
            outside_business_hours: {
                use_during_business_hours_settings: true,
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: '',
            },
        }

        const {result} = renderCanPayloadBeSubmittedHook(payload)

        expect(result.current).toBe(false)
    })
})

describe('useVoiceMessageValidation().useVoiceMessageValidation', () => {
    const mockObjectURL = 'fake-url'

    beforeEach(() => {
        window.URL.createObjectURL = jest.fn().mockReturnValue(mockObjectURL)
        mockStore.clearActions()
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    const renderUseVoiceMessageValidationHook = () =>
        renderHook(
            () => {
                return useVoiceMessageValidation()
            },
            {
                wrapper,
            }
        )

    it('is successful', async () => {
        const fileName = 'example.mp3'
        const event = {
            target: {
                files: [
                    new File(['test data'], fileName, {
                        type: 'audio/mpeg',
                    }),
                ],
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>
        getAudioFileDurationSpy.mockResolvedValue(5)

        const {result} = renderUseVoiceMessageValidationHook()
        await act(async () => {
            const voiceRecordingUpload =
                await result.current.validateVoiceRecordingUpload(event, 10)

            expect(voiceRecordingUpload).toBeTruthy()
            if (voiceRecordingUpload) {
                const {url, newVoiceFields} = voiceRecordingUpload
                expect(url).toEqual(mockObjectURL)
                expect(newVoiceFields?.new_voice_recording_file_name).toEqual(
                    fileName
                )
            }
        })
    })

    it('is invalid because audio duration too long', async () => {
        const fileName = 'example.mp3'
        const event = {
            target: {
                files: [
                    new File(['test data'], fileName, {
                        type: 'audio/mpeg',
                    }),
                ],
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>
        getAudioFileDurationSpy.mockResolvedValue(5000)

        const {result} = renderUseVoiceMessageValidationHook()

        await act(async () => {
            const res = await result.current.validateVoiceRecordingUpload(
                event,
                10
            )
            expect(res).toBeNull()
        })

        const notification = mockStore.getActions()[0]
        expect(notification).toHaveProperty(
            'payload.message',
            'Please upload an audio file of 10 seconds or less.'
        )
    })

    it('is invalid because audio size too big', async () => {
        const fileName = 'example.mp3'
        const audioFile = new File(['test data'], fileName, {
            type: 'audio/mpeg',
        })
        Object.defineProperty(audioFile, 'size', {value: 1_000_000 + 1})
        const event = {
            target: {
                files: [audioFile],
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>
        getAudioFileDurationSpy.mockResolvedValue(5)

        const {result} = renderUseVoiceMessageValidationHook()

        await act(async () => {
            const res = await result.current.validateVoiceRecordingUpload(
                event,
                10,
                1,
                true
            )
            expect(res).toBeNull()
        })

        const notification = mockStore.getActions()[0]
        expect(notification).toHaveProperty(
            'payload.message',
            'File too large. Upload a recording smaller than 1MB.'
        )
    })

    it('is invalid because wrong audio file format', async () => {
        const fileName = 'example.mp3'
        const event = {
            target: {
                files: [
                    new File(['test data'], fileName, {
                        type: 'audio/mpeg',
                    }),
                ],
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>
        getAudioFileDurationSpy.mockRejectedValue(new Error())

        const {result} = renderUseVoiceMessageValidationHook()

        await act(async () => {
            const res = await result.current.validateVoiceRecordingUpload(
                event,
                10
            )
            expect(res).toBeNull()
            const notification = mockStore.getActions()[0]
            expect(notification).toHaveProperty(
                'payload.message',
                'Invalid audio file format provided. Please upload a valid mp3 file.'
            )
        })
    })
})

describe('useVoiceMessageValidation().cleanUpPayload', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    const renderCleanUpPayloadHook = (
        payload: Maybe<PhoneIntegrationVoicemailSettings>
    ) =>
        renderHook(
            () => {
                const {cleanUpPayload} = useVoiceMessageValidation()
                return cleanUpPayload(payload)
            },
            {
                wrapper,
            }
        )

    it('cleans up for outside_business_hours - use same settings', () => {
        const payload: PhoneIntegrationVoicemailSettings = {
            voice_message_type: VoiceMessageType.None,
            allow_to_leave_voicemail: true,
            outside_business_hours: {
                use_during_business_hours_settings: true,
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: '',
            },
        }
        const expected = {
            voice_message_type: VoiceMessageType.None,
            allow_to_leave_voicemail: true,
            outside_business_hours: {
                use_during_business_hours_settings: true,
            },
        }

        const {result} = renderCleanUpPayloadHook(payload)
        expect(result.current).toEqual(expected)
    })

    it('cleans up incomplete voice recording', () => {
        const payload = {
            voice_message_type: VoiceMessageType.None,
            allow_to_leave_voicemail: true,
            new_voice_recording_file_name: undefined,
            new_voice_recording_file_type: undefined,
            voice_recording_file_path: undefined,
            text_to_speech_content: 'Test me',
            outside_business_hours: {
                use_during_business_hours_settings: false,
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Test',
                new_voice_recording_file_name: undefined,
                new_voice_recording_file_type: undefined,
                voice_recording_file_path: undefined,
            },
        }
        const expected = {
            voice_message_type: VoiceMessageType.None,
            allow_to_leave_voicemail: true,
            voice_recording_file_path: undefined,
            outside_business_hours: {
                use_during_business_hours_settings: false,
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Test',
            },
        }

        const {result} = renderCleanUpPayloadHook(payload)
        expect(result.current).toEqual(expected)
    })

    it('cleans up half updated text', () => {
        const payload = {
            voice_message_type: VoiceMessageType.None,
            allow_to_leave_voicemail: true,
            text_to_speech_content: 'Test me',
            outside_business_hours: {
                use_during_business_hours_settings: false,
                voice_message_type: VoiceMessageType.None,
                text_to_speech_content: 'Test',
            },
        }
        const expected = {
            voice_message_type: VoiceMessageType.None,
            allow_to_leave_voicemail: true,
            outside_business_hours: {
                use_during_business_hours_settings: false,
                voice_message_type: VoiceMessageType.None,
            },
        }

        const {result} = renderCleanUpPayloadHook(payload)
        expect(result.current).toEqual(expected)
    })

    it('cleans up correctly correct text payload', () => {
        const payload: PhoneIntegrationVoicemailSettings = {
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: 'Hello!',
            allow_to_leave_voicemail: true,
            outside_business_hours: {
                use_during_business_hours_settings: false,
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Test',
            },
        }

        const {result} = renderCleanUpPayloadHook(payload)
        expect(result.current).toEqual(payload)
    })

    it('cleans up correctly correct voice recording payload', () => {
        const payload: PhoneIntegrationVoicemailSettings = {
            voice_message_type: VoiceMessageType.VoiceRecording,
            voice_recording_file_path: 'test',
            new_voice_recording_file_name: 'test',
            new_voice_recording_file_type: 'test',
            new_voice_recording_file: 'test',
            allow_to_leave_voicemail: true,
            outside_business_hours: {
                use_during_business_hours_settings: false,
                voice_message_type: VoiceMessageType.VoiceRecording,
                voice_recording_file_path: 'test',
                new_voice_recording_file_name: 'test',
                new_voice_recording_file_type: 'test',
                new_voice_recording_file: 'test',
            },
        }

        const {result} = renderCleanUpPayloadHook(payload)
        expect(result.current).toEqual(payload)
    })
})

describe('useVoiceMessageValidation().isValidTextToSpeech', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    const renderIsValidTextToSpeechHook = (
        payload: Maybe<PhoneIntegrationVoicemailSettings>
    ) =>
        renderHook(
            () => {
                const {isValidTextToSpeech} = useVoiceMessageValidation()
                return isValidTextToSpeech(payload)
            },
            {
                wrapper,
            }
        )

    it('checks invalid text to speech content for outside business hours', () => {
        const payload: PhoneIntegrationVoicemailSettings = {
            voice_message_type: VoiceMessageType.None,
            allow_to_leave_voicemail: true,
            outside_business_hours: {
                use_during_business_hours_settings: true,
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: '',
            },
        }
        const {result} = renderIsValidTextToSpeechHook(payload)
        expect(result.current).toEqual(false)
    })

    it('checks invalid text to speech content for during business hours', () => {
        const payload: PhoneIntegrationVoicemailSettings = {
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: '',
            allow_to_leave_voicemail: true,
            outside_business_hours: {
                use_during_business_hours_settings: true,
                voice_message_type: VoiceMessageType.None,
            },
        }
        const {result} = renderIsValidTextToSpeechHook(payload)
        expect(result.current).toEqual(false)
    })

    it('checks valid text to speech', () => {
        const payload: PhoneIntegrationVoicemailSettings = {
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: 'Test me',
            allow_to_leave_voicemail: true,
            outside_business_hours: {
                use_during_business_hours_settings: true,
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'another message',
            },
        }
        const {result} = renderIsValidTextToSpeechHook(payload)
        expect(result.current).toEqual(true)
    })

    it('checks valid for other message types', () => {
        const payload: PhoneIntegrationVoicemailSettings = {
            voice_message_type: VoiceMessageType.None,
            allow_to_leave_voicemail: true,
            outside_business_hours: {
                use_during_business_hours_settings: true,
                voice_message_type: VoiceMessageType.VoiceRecording,
                voice_recording_file_path: 'file.mp3',
            },
        }
        const {result} = renderIsValidTextToSpeechHook(payload)
        expect(result.current).toEqual(true)
    })
})

describe('useVoiceMessageValidation().cleanUpIvrPayload', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    const renderCleanUpPayloadHook = (
        payload: Maybe<PhoneIntegrationIvrSettings>
    ) =>
        renderHook(
            () => {
                const {cleanUpIvrPayload} = useVoiceMessageValidation()
                return cleanUpIvrPayload(payload)
            },
            {
                wrapper,
            }
        )

    it('handles null values', () => {
        const {result} = renderCleanUpPayloadHook(null)
        expect(result.current).toEqual(null)
    })

    it('handles empty values', () => {
        const payload = {
            greeting_message: {},
            menu_options: [],
        } as unknown as PhoneIntegrationIvrSettings

        const {result} = renderCleanUpPayloadHook(payload)
        expect(result.current).toEqual(payload)
    })

    it('cleans up greeting message', () => {
        const payload = {
            greeting_message: {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Hello!',
                voice_recording_file_path: 'testing',
            },
            menu_options: [],
        }
        const expected = {
            greeting_message: {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Hello!',
            },
            menu_options: [],
        }

        const {result} = renderCleanUpPayloadHook(payload)
        expect(result.current).toEqual(expected)
    })

    it('cleans up menuOptions', () => {
        const payload = {
            greeting_message: {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Hello!',
            },
            menu_options: [
                {
                    action: IvrMenuActionType.PlayMessage,
                    digit: '1',
                    voice_message: {
                        voice_message_type: VoiceMessageType.VoiceRecording,
                        text_to_speech_content: 'Test',
                        voice_recording_file_path: 'testing',
                    },
                },
                {
                    action: IvrMenuActionType.ForwardToExternalNumber,
                    digit: '2',
                    forward_call: {
                        phone_number: '123',
                    },
                },
                {
                    action: IvrMenuActionType.SendToSms,
                    digit: '3',
                    sms_deflection: {
                        confirmation_message: {
                            voice_message_type: VoiceMessageType.TextToSpeech,
                            text_to_speech_content: 'Test',
                            voice_recording_file_path: 'testing',
                        },
                        sms_integration_id: 1,
                        sms_content: 'another test',
                    },
                },
            ],
        } as PhoneIntegrationIvrSettings
        const expected = {
            greeting_message: {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Hello!',
            },
            menu_options: [
                {
                    action: IvrMenuActionType.PlayMessage,
                    digit: '1',
                    voice_message: {
                        voice_message_type: VoiceMessageType.VoiceRecording,
                        voice_recording_file_path: 'testing',
                    },
                },
                {
                    action: IvrMenuActionType.ForwardToExternalNumber,
                    digit: '2',
                    forward_call: {
                        phone_number: '123',
                    },
                },
                {
                    action: IvrMenuActionType.SendToSms,
                    digit: '3',
                    sms_deflection: {
                        confirmation_message: {
                            voice_message_type: VoiceMessageType.TextToSpeech,
                            text_to_speech_content: 'Test',
                        },
                        sms_integration_id: 1,
                        sms_content: 'another test',
                    },
                },
            ],
        }

        const {result} = renderCleanUpPayloadHook(payload)
        expect(result.current).toEqual(expected)
    })
})

describe('useVoiceMessageValidation().areVoiceMessagesTheSame', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    const renderAreVoiceMessagesTheSame = (
        voiceMessage: VoiceMessage,
        other: VoiceMessage
    ) =>
        renderHook(
            () => {
                const {areVoiceMessagesTheSame} = useVoiceMessageValidation()
                return areVoiceMessagesTheSame(voiceMessage, other)
            },
            {
                wrapper,
            }
        )

    it('should not be the same when they have different type', () => {
        const {result} = renderAreVoiceMessagesTheSame(
            {
                voice_message_type: VoiceMessageType.None,
            },
            {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Hello!',
            }
        )
        expect(result.current).toBe(false)
    })

    it('should be the same when they are both none', () => {
        const {result} = renderAreVoiceMessagesTheSame(
            {
                voice_message_type: VoiceMessageType.None,
            },
            {
                voice_message_type: VoiceMessageType.None,
            }
        )
        expect(result.current).toBe(true)
    })

    it('should be the same when they are both TTS and have the same text', () => {
        const {result} = renderAreVoiceMessagesTheSame(
            {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Hello!',
            },
            {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Hello!',
            }
        )
        expect(result.current).toBe(true)
    })

    it('should not be the same when they are both TTS but have different text', () => {
        const {result} = renderAreVoiceMessagesTheSame(
            {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Hello!',
            },
            {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Ciao!',
            }
        )
        expect(result.current).toBe(false)
    })

    it('should be the same when they are both custom recording and have the same audio file URL', () => {
        const {result} = renderAreVoiceMessagesTheSame(
            {
                voice_message_type: VoiceMessageType.VoiceRecording,
                voice_recording_file_path: 'example.mp3',
            },
            {
                voice_message_type: VoiceMessageType.VoiceRecording,
                voice_recording_file_path: 'example.mp3',
            }
        )
        expect(result.current).toBe(true)
    })

    it('should not be the same when they are both custom recording but have different audio file URL', () => {
        const {result} = renderAreVoiceMessagesTheSame(
            {
                voice_message_type: VoiceMessageType.VoiceRecording,
                voice_recording_file_path: 'example.mp3',
            },
            {
                voice_message_type: VoiceMessageType.VoiceRecording,
                voice_recording_file_path: 'new_upload.mp3',
            }
        )
        expect(result.current).toBe(false)
    })

    it.each([
        {
            voiceMessage: voiceMessageWithNewAudioFile,
            other: baseVoiceMessage,
        },
        {
            voiceMessage: baseVoiceMessage,
            other: voiceMessageWithNewAudioFile,
        },
    ])(
        'should not be the same when they are both custom recording and have the same audio file URL, but one of them has new file data',
        ({voiceMessage, other}) => {
            const {result} = renderAreVoiceMessagesTheSame(voiceMessage, other)
            expect(result.current).toBe(false)
        }
    )
})

describe('useVoiceMessageValidation().areWaitMusicPreferencesTheSame', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    const renderAreWaitMusicPreferencesTheSame = (
        preferences: LocalWaitMusicPreferences,
        other: LocalWaitMusicPreferences
    ) =>
        renderHook(
            () => {
                const {areWaitMusicPreferencesTheSame} =
                    useVoiceMessageValidation()
                return areWaitMusicPreferencesTheSame(preferences, other)
            },
            {
                wrapper,
            }
        )

    it('should not be the same when they have different type', () => {
        const {result} = renderAreWaitMusicPreferencesTheSame(
            {
                type: WaitMusicType.Library,
            },
            {
                type: WaitMusicType.CustomRecording,
            }
        )
        expect(result.current).toBe(false)
    })

    it('should be the same when they are both library and have the same key', () => {
        const {result} = renderAreWaitMusicPreferencesTheSame(
            {
                type: WaitMusicType.Library,
                library: {
                    audio_file_path:
                        'https://assets.gorgias.io/phone/Ringtone.mp3',
                    key: 'ringtone',
                    name: 'Ringtone',
                },
            },
            {
                type: WaitMusicType.Library,
                library: {
                    audio_file_path:
                        'https://assets.gorgias.io/phone/Ringtone.mp3',
                    key: 'ringtone',
                    name: 'Ringtone',
                },
            }
        )
        expect(result.current).toBe(true)
    })

    it('should not be the same when they are both library but have different key', () => {
        const {result} = renderAreWaitMusicPreferencesTheSame(
            {
                type: WaitMusicType.Library,
                library: {
                    audio_file_path:
                        'https://assets.gorgias.io/phone/Ringtone.mp3',
                    key: 'ringtone',
                    name: 'Ringtone',
                },
            },
            {
                type: WaitMusicType.Library,
                library: {
                    audio_file_path:
                        'https://assets.gorgias.io/phone/CatchyJingle.mp3',
                    key: 'catchy_jingle',
                    name: 'Catchy Jingle',
                },
            }
        )
        expect(result.current).toBe(false)
    })

    it('should be the same when they are both custom recording and have the same audio file URL', () => {
        const {result} = renderAreWaitMusicPreferencesTheSame(
            {
                type: WaitMusicType.CustomRecording,
                custom_recording: {
                    audio_file_name: 'cool-rock-riffs.mp3',
                    audio_file_path:
                        'https://uploads.gorgias.io/phone/CoolRockRiffs.mp3',
                    audio_file_type: 'audio/mpeg',
                },
            },
            {
                type: WaitMusicType.CustomRecording,
                custom_recording: {
                    audio_file_name: 'cool-rock-riffs.mp3',
                    audio_file_path:
                        'https://uploads.gorgias.io/phone/CoolRockRiffs.mp3',
                    audio_file_type: 'audio/mpeg',
                },
            }
        )
        expect(result.current).toBe(true)
    })

    it('should not be the same when they are both custom recording but have different audio file URL', () => {
        const {result} = renderAreWaitMusicPreferencesTheSame(
            {
                type: WaitMusicType.CustomRecording,
                custom_recording: {
                    audio_file_name: 'cool-rock-riffs.mp3',
                    audio_file_path:
                        'https://uploads.gorgias.io/phone/CoolRockRiffs.mp3',
                    audio_file_type: 'audio/mpeg',
                },
            },
            {
                type: WaitMusicType.CustomRecording,
                custom_recording: {
                    audio_file_name: 'magic-bossa-nova.mp3',
                    audio_file_path:
                        'https://uploads.gorgias.io/phone/MagicBossaNova.mp3',
                    audio_file_type: 'audio/mpeg',
                },
            }
        )
        expect(result.current).toBe(false)
    })

    it.each([
        {
            preferences: {
                type: WaitMusicType.CustomRecording,
                custom_recording: {
                    audio_file_name: 'cool-rock-riffs.mp3',
                    audio_file_path:
                        'https://uploads.gorgias.io/phone/CoolRockRiffs.mp3',
                    audio_file_type: 'audio/mpeg',
                    audio_file: 'data:audio/mpeg;base64,SUQzBAAAAAAAf1',
                },
            },
            other: {
                type: WaitMusicType.CustomRecording,
                custom_recording: {
                    audio_file_name: 'cool-rock-riffs.mp3',
                    audio_file_path:
                        'https://uploads.gorgias.io/phone/CoolRockRiffs.mp3',
                    audio_file_type: 'audio/mpeg',
                },
            },
        },
        {
            preferences: {
                type: WaitMusicType.CustomRecording,
                custom_recording: {
                    audio_file_name: 'cool-rock-riffs.mp3',
                    audio_file_path:
                        'https://uploads.gorgias.io/phone/CoolRockRiffs.mp3',
                    audio_file_type: 'audio/mpeg',
                },
            },
            other: {
                type: WaitMusicType.CustomRecording,
                custom_recording: {
                    audio_file_name: 'cool-rock-riffs.mp3',
                    audio_file_path:
                        'https://uploads.gorgias.io/phone/CoolRockRiffs.mp3',
                    audio_file_type: 'audio/mpeg',
                    audio_file: 'data:audio/mpeg;base64,SUQzBAAAAAAAf1',
                },
            },
        },
    ])(
        'should not be the same when they are both custom recording and have the same audio file URL, but one of them has new file data',
        ({preferences, other}) => {
            const {result} = renderAreWaitMusicPreferencesTheSame(
                preferences,
                other
            )
            expect(result.current).toBe(false)
        }
    )
})
