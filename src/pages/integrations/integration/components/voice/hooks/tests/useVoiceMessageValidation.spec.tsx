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
        payload: Partial<PhoneIntegrationVoicemailSettings>
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
        const payload: Partial<PhoneIntegrationVoicemailSettings> = {
            voice_message_type: VoiceMessageType.None,
        }

        const {result} = renderCanPayloadBeSubmittedHook(payload)
        expect(result.current).toBe(true)
    })

    it('canPayloadBeSubmitted checks message_type = VoiceRecording successful', () => {
        const payload: Partial<PhoneIntegrationVoicemailSettings> = {
            voice_message_type: VoiceMessageType.VoiceRecording,
            voice_recording_file_path: 'test',
        }

        const {result} = renderCanPayloadBeSubmittedHook(payload)

        expect(result.current).toBe(true)
    })

    it('canPayloadBeSubmitted checks voice message file failure', () => {
        const payload: Partial<PhoneIntegrationVoicemailSettings> = {
            voice_message_type: VoiceMessageType.VoiceRecording,
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
        const payload: Partial<PhoneIntegrationVoicemailSettings> = {
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: 'This is a message',
        }

        const {result} = renderCanPayloadBeSubmittedHook(payload)

        expect(result.current).toBe(true)
    })

    it('canPayloadBeSubmitted checks text to speech field', () => {
        const payload: Partial<PhoneIntegrationVoicemailSettings> = {
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: '',
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
