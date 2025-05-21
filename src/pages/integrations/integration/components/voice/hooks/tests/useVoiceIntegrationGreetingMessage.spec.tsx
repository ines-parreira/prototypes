import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    HttpResponse,
    UpdateWaitMusicPreferences,
    updateWaitMusicPreferences,
} from '@gorgias/api-client'
import { WaitMusicType } from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    IntegrationType,
    LocalWaitMusicPreferences,
    PhoneIntegration,
    PhoneRingingBehaviour,
    VoiceMessageType,
} from 'models/integration/types'
import { PhoneCountry, PhoneFunction } from 'models/phoneNumber/types'
import * as api from 'pages/integrations/integration/components/phone/actions'
import * as actions from 'state/integrations/actions'
import { UPDATE_INTEGRATION_ERROR } from 'state/integrations/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { DEFAULT_WAIT_MUSIC_PREFERENCES } from '../../waitMusicLibraryConstants'
import useVoiceIntegrationGreetingMessage from '../useVoiceIntegrationGreetingMessage'

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

const mockStore = configureMockStore<RootState>()({} as RootState)

jest.mock('@gorgias/api-client')
const updateWaitMusicPreferencesMock = assumeMock(updateWaitMusicPreferences)

const queryClient = mockQueryClient()

jest.mock('models/api/resources')
const updatePhoneGreetingMessageConfigurationMock = jest.spyOn(
    api,
    'updatePhoneGreetingMessageConfiguration',
)

const fetchIntegratonsMock = jest.spyOn(actions, 'fetchIntegrations')

jest.mock('hooks/useAppDispatch')
const dispatchMock = jest.fn()
assumeMock(useAppDispatch).mockReturnValue(dispatchMock)

jest.mock('state/notifications/actions')
const notifyMock = assumeMock(notify)

const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <Provider store={mockStore}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </Provider>
)

describe('useVoiceIntegrationGreetingMessage', () => {
    beforeEach(() => {
        dispatchMock.mockReset()
    })

    it('should return default values', () => {
        const { result } = renderHook(
            () => useVoiceIntegrationGreetingMessage(standardIntegration),
            { wrapper },
        )

        const {
            greetingMessagePayload,
            waitMusicPayload,
            isGreetingMessageLoading,
            isWaitMusicLoading,
            isSubmittable,
        } = result.current
        expect(greetingMessagePayload).toStrictEqual({
            voice_message_type: VoiceMessageType.None,
        })
        expect(waitMusicPayload).toStrictEqual(DEFAULT_WAIT_MUSIC_PREFERENCES)
        expect(isGreetingMessageLoading).toBe(false)
        expect(isWaitMusicLoading).toBe(false)
        expect(isSubmittable).toBe(false)
    })

    it('should change greeting message preferences when integration updates', () => {
        const { result, rerender } = renderHook(
            ({ integration }) =>
                useVoiceIntegrationGreetingMessage(integration),
            { wrapper, initialProps: { integration: standardIntegration } },
        )

        const updatedIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                greeting_message: {
                    voice_message_type: VoiceMessageType.TextToSpeech,
                    text_to_speech_content: 'Welcome to Acme Inc.!',
                },
            },
        }

        rerender({ integration: updatedIntegration })

        expect(result.current.greetingMessagePayload).toStrictEqual({
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: 'Welcome to Acme Inc.!',
        })
    })

    it('should change greeting message and update it', async () => {
        const { result } = renderHook(
            () => useVoiceIntegrationGreetingMessage(standardIntegration),
            { wrapper },
        )

        expect(result.current.greetingMessagePayload).toStrictEqual({
            voice_message_type: VoiceMessageType.None,
        })

        const newGreetingMessagePayload = {
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: 'Welcome to Acme Inc.!',
        }

        act(() => {
            result.current.setGreetingMessagePayload(newGreetingMessagePayload)
        })
        expect(result.current.greetingMessagePayload).toStrictEqual(
            newGreetingMessagePayload,
        )
        expect(result.current.isSubmittable).toBe(true)

        await act(async () => {
            await result.current.makeApiCalls()
        })

        expect(result.current.isGreetingMessageLoading).toBe(false)
        expect(
            updatePhoneGreetingMessageConfigurationMock,
        ).toHaveBeenCalledWith(newGreetingMessagePayload)
        expect(updateWaitMusicPreferencesMock).not.toHaveBeenCalled()
        expect(dispatchMock).toHaveBeenCalled()
        expect(fetchIntegratonsMock).toHaveBeenCalledWith()
    })

    it('should handle error when updating greeting message', async () => {
        dispatchMock.mockRejectedValue('An error occurred')

        const { result } = renderHook(
            () => useVoiceIntegrationGreetingMessage(standardIntegration),
            { wrapper },
        )

        const newGreetingMessagePayload = {
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: 'Welcome to Acme Inc.!',
        }

        act(() => {
            result.current.setGreetingMessagePayload(newGreetingMessagePayload)
        })
        expect(result.current.greetingMessagePayload).toStrictEqual(
            newGreetingMessagePayload,
        )
        expect(result.current.isSubmittable).toBe(true)

        await act(async () => {
            await result.current.makeApiCalls()
        })

        expect(result.current.isGreetingMessageLoading).toBe(false)
    })

    it('should change custom wait music preferences when integration updates', () => {
        const { result, rerender } = renderHook(
            ({ integration }) =>
                useVoiceIntegrationGreetingMessage(integration),
            { wrapper, initialProps: { integration: standardIntegration } },
        )

        const updatedIntegration = {
            ...standardIntegration,
            meta: {
                ...standardIntegration.meta,
                wait_music: {
                    type: WaitMusicType.Library,
                    library: {
                        key: 'catchy_jingle',
                        name: 'Catchy Jingle',
                        audio_file_path:
                            'https://assets.gorgias.io/phone/catchy-jingle.mp3',
                    },
                },
            },
        }

        rerender({ integration: updatedIntegration })

        expect(result.current.waitMusicPayload).toStrictEqual({
            type: WaitMusicType.Library,
            library: {
                key: 'catchy_jingle',
                name: 'Catchy Jingle',
                audio_file_path:
                    'https://assets.gorgias.io/phone/catchy-jingle.mp3',
            },
        })
    })

    it('should change custom wait music and update it', async () => {
        updateWaitMusicPreferencesMock.mockReturnValue(
            Promise.resolve({} as HttpResponse<void>),
        )

        const { result } = renderHook(
            () => useVoiceIntegrationGreetingMessage(standardIntegration),
            { wrapper },
        )

        expect(result.current.waitMusicPayload).toStrictEqual(
            DEFAULT_WAIT_MUSIC_PREFERENCES,
        )

        const newWaitMusicPayload = {
            type: WaitMusicType.Library,
            library: {
                key: 'catchy_jingle',
                name: 'Catchy Jingle',
                audio_file_path:
                    'https://assets.gorgias.io/phone/catchy-jingle.mp3',
            },
        }

        act(() => {
            result.current.setWaitMusicPayload(newWaitMusicPayload)
        })
        expect(result.current.waitMusicPayload).toStrictEqual(
            newWaitMusicPayload,
        )
        expect(result.current.isSubmittable).toBe(true)

        await act(async () => {
            await result.current.makeApiCalls()
        })

        expect(
            updatePhoneGreetingMessageConfigurationMock,
        ).not.toHaveBeenCalled()
        expect(updateWaitMusicPreferencesMock).toHaveBeenCalledWith(
            1,
            newWaitMusicPayload,
            undefined,
        )
        expect(dispatchMock).toHaveBeenCalled()
        expect(notifyMock).toHaveBeenCalledWith({
            status: NotificationStatus.Success,
            message: 'Wait music successfully updated.',
        })
        expect(fetchIntegratonsMock).toHaveBeenCalledWith()
    })

    it('should handle error when updating wait music', async () => {
        updateWaitMusicPreferencesMock.mockReturnValue(
            Promise.reject('An error occurred'),
        )

        const { result } = renderHook(
            () => useVoiceIntegrationGreetingMessage(standardIntegration),
            { wrapper },
        )

        expect(result.current.waitMusicPayload).toStrictEqual(
            DEFAULT_WAIT_MUSIC_PREFERENCES,
        )

        const newWaitMusicPayload = {
            type: WaitMusicType.Library,
            library: {
                key: 'catchy_jingle',
                name: 'Catchy Jingle',
                audio_file_path:
                    'https://assets.gorgias.io/phone/catchy-jingle.mp3',
            },
        }

        act(() => {
            result.current.setWaitMusicPayload(newWaitMusicPayload)
        })
        expect(result.current.waitMusicPayload).toStrictEqual(
            newWaitMusicPayload,
        )
        expect(result.current.isSubmittable).toBe(true)

        await act(async () => {
            await result.current.makeApiCalls()
        })

        expect(updateWaitMusicPreferencesMock).toHaveBeenCalledWith(
            1,
            newWaitMusicPayload,
            undefined,
        )
        expect(dispatchMock).toHaveBeenCalledWith({
            type: UPDATE_INTEGRATION_ERROR,
            error: 'An error occurred',
            verbose: true,
        })
        expect(notifyMock).not.toHaveBeenCalled()
        expect(fetchIntegratonsMock).not.toHaveBeenCalled()
    })

    it.each<{
        startingWaitMusicPreferences: LocalWaitMusicPreferences
        newWaitMusicLocalPayload: LocalWaitMusicPreferences
        expectedWaitMusicUpdatePayload: UpdateWaitMusicPreferences
    }>([
        {
            startingWaitMusicPreferences: {
                type: WaitMusicType.Library,
                library: {
                    key: 'catchy_jingle',
                    name: 'Catchy Jingle',
                    audio_file_path:
                        'https://assets.gorgias.io/phone/catchy-jingle.mp3',
                },
            },
            newWaitMusicLocalPayload: {
                type: WaitMusicType.Library,
                library: {
                    key: 'cool_rock_riffs',
                    name: 'Cool Rock Riffs',
                    audio_file_path:
                        'https://assets.gorgias.io/phone/cool-rock-riffs.mp3',
                },
            },
            expectedWaitMusicUpdatePayload: {
                type: WaitMusicType.Library,
                library: {
                    key: 'cool_rock_riffs',
                    name: 'Cool Rock Riffs',
                    audio_file_path:
                        'https://assets.gorgias.io/phone/cool-rock-riffs.mp3',
                },
            },
        },
        {
            startingWaitMusicPreferences: {
                type: WaitMusicType.CustomRecording,
                custom_recording: {
                    audio_file_name: 'elevator-bossa-nova.mp3',
                    audio_file_path:
                        'https://uploads.gorgias.io/phone/elevator-bossa-nova.mp3',
                    audio_file_type: 'audio/mpeg',
                },
            },
            newWaitMusicLocalPayload: {
                type: WaitMusicType.CustomRecording,
                custom_recording: {
                    audio_file_name: 'moonlight-coffe.mp3',
                    audio_file_type: 'audio/mpeg',
                    audio_file: 'data:audio/mpeg;base64,SUQzBAAAAAAAf1',
                    audio_file_path:
                        'https://uploads.gorgias.io/phone/elevator-bossa-nova.mp3',
                },
            },
            expectedWaitMusicUpdatePayload: {
                type: WaitMusicType.CustomRecording,
                custom_recording: {
                    audio_file_name: 'moonlight-coffe.mp3',
                    audio_file_type: 'audio/mpeg',
                    audio_file: 'data:audio/mpeg;base64,SUQzBAAAAAAAf1',
                },
            },
        },
        {
            startingWaitMusicPreferences: {
                type: WaitMusicType.CustomRecording,
                custom_recording: {
                    audio_file_name: 'elevator-bossa-nova.mp3',
                    audio_file_path:
                        'https://uploads.gorgias.io/phone/elevator-bossa-nova.mp3',
                    audio_file_type: 'audio/mpeg',
                },
                library: {
                    key: 'catchy_jingle',
                    name: 'Catchy Jingle',
                    audio_file_path:
                        'https://assets.gorgias.io/phone/catchy-jingle.mp3',
                },
            },
            newWaitMusicLocalPayload: {
                type: WaitMusicType.Library,
                library: {
                    key: 'catchy_jingle',
                    name: 'Catchy Jingle',
                    audio_file_path:
                        'https://assets.gorgias.io/phone/catchy-jingle.mp3',
                },
            },
            expectedWaitMusicUpdatePayload: {
                type: WaitMusicType.Library,
            },
        },
    ])(
        'should handle custom wait music library change',
        async ({
            startingWaitMusicPreferences,
            newWaitMusicLocalPayload,
            expectedWaitMusicUpdatePayload,
        }) => {
            updateWaitMusicPreferencesMock.mockReturnValue(
                Promise.resolve({} as HttpResponse<void>),
            )

            const standardIntegrationWithWaitMusicPreferences = {
                ...standardIntegration,
                meta: {
                    ...standardIntegration.meta,
                    wait_music: startingWaitMusicPreferences,
                },
            }

            const { result } = renderHook(
                () =>
                    useVoiceIntegrationGreetingMessage(
                        standardIntegrationWithWaitMusicPreferences,
                    ),
                { wrapper },
            )

            act(() => {
                result.current.setWaitMusicPayload(newWaitMusicLocalPayload)
            })

            expect(result.current.waitMusicPayload).toStrictEqual(
                newWaitMusicLocalPayload,
            )
            expect(result.current.isSubmittable).toBe(true)

            await act(async () => {
                await result.current.makeApiCalls()
            })

            expect(updateWaitMusicPreferencesMock).toHaveBeenCalledWith(
                1,
                expectedWaitMusicUpdatePayload,
                undefined,
            )
        },
    )

    it.each([
        {
            type: WaitMusicType.Library,
        },
        {
            type: WaitMusicType.CustomRecording,
        },
    ])(
        'should handle incomplete wait music payload',
        (invalidWaitMusicPayload: LocalWaitMusicPreferences) => {
            const { result } = renderHook(
                () =>
                    useVoiceIntegrationGreetingMessage({
                        ...standardIntegration,
                        meta: {
                            ...standardIntegration.meta,
                            wait_music: { type: WaitMusicType.Library },
                        },
                    }),
                { wrapper },
            )

            expect(result.current.waitMusicPayload).toStrictEqual({
                type: WaitMusicType.Library,
            })

            act(() => {
                result.current.setWaitMusicPayload(invalidWaitMusicPayload)
            })
            expect(result.current.waitMusicPayload).toStrictEqual(
                invalidWaitMusicPayload,
            )
            expect(result.current.isSubmittable).toBe(false)
        },
    )

    it('should change both greeting message and custom wait music and update them', async () => {
        updateWaitMusicPreferencesMock.mockReturnValue(
            Promise.resolve({} as HttpResponse<void>),
        )

        const { result } = renderHook(
            () => useVoiceIntegrationGreetingMessage(standardIntegration),
            { wrapper },
        )

        expect(result.current.greetingMessagePayload).toStrictEqual({
            voice_message_type: VoiceMessageType.None,
        })
        expect(result.current.waitMusicPayload).toStrictEqual(
            DEFAULT_WAIT_MUSIC_PREFERENCES,
        )

        const newGreetingMessagePayload = {
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: 'Welcome to Acme Inc.!',
        }
        const newWaitMusicPayload = {
            type: WaitMusicType.Library,
            library: {
                key: 'catchy_jingle',
                name: 'Catchy Jingle',
                audio_file_path:
                    'https://assets.gorgias.io/phone/catchy-jingle.mp3',
            },
        }

        act(() => {
            result.current.setGreetingMessagePayload(newGreetingMessagePayload)
            result.current.setWaitMusicPayload(newWaitMusicPayload)
        })
        expect(result.current.greetingMessagePayload).toStrictEqual(
            newGreetingMessagePayload,
        )
        expect(result.current.waitMusicPayload).toStrictEqual(
            newWaitMusicPayload,
        )
        expect(result.current.isSubmittable).toBe(true)

        await act(async () => {
            await result.current.makeApiCalls()
        })

        expect(result.current.isGreetingMessageLoading).toBe(false)
        expect(
            updatePhoneGreetingMessageConfigurationMock,
        ).toHaveBeenCalledWith(newGreetingMessagePayload)
        expect(updateWaitMusicPreferencesMock).toHaveBeenCalledWith(
            1,
            newWaitMusicPayload,
            undefined,
        )
        expect(dispatchMock).toHaveBeenCalled()
        expect(notifyMock).toHaveBeenCalledWith({
            status: NotificationStatus.Success,
            message: 'Wait music successfully updated.',
        })
        expect(fetchIntegratonsMock).toHaveBeenCalledWith()
    })
})
