import React from 'react'
import {act, renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState} from 'state/types'
import {VoiceMessageType} from 'models/integration/constants'
import {PhoneIntegrationVoicemailSettings} from 'models/integration/types'
import useVoiceMessageValidation from '../useVoiceMessageValidation'
import * as utils from '../../utils'

const mockStore = configureMockStore<RootState>([thunk])({} as RootState)
const getAudioFileDurationSpy = jest.spyOn(utils, 'getAudioFileDuration')

const wrapper = ({children}: {children: React.ReactNode}) => (
    <Provider store={mockStore}>{children}</Provider>
)

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

    it('useVoiceMessageValidation successful', async () => {
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

    it('useVoiceMessageValidation validation error', async () => {
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

    it('useVoiceMessageValidation invalid file error', async () => {
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
