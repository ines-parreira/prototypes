import {
    HttpResponse,
    IntegrationType,
    updatePhoneSettings,
    VoiceMessageType,
} from '@gorgias/api-client'
import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import React from 'react'

import {useFormContext} from 'react-hook-form'

import {integrationsState} from 'fixtures/integrations'
import useAppDispatch from 'hooks/useAppDispatch'
import {DEFAULT_RECORDING_NOTIFICATION} from 'models/integration/constants'
import {PhoneIntegration} from 'models/integration/types'
import {fetchIntegrations} from 'state/integrations/actions'
import {UPDATE_INTEGRATION_ERROR} from 'state/integrations/constants'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import {
    DEFAULT_TRANSCRIBE_PREFERENCES,
    DEFAULT_WAIT_TIME_PREFERENCES,
    RING_TIME_DEFAULT_VALUE,
} from '../constants'
import useVoicePreferencesForm, {
    getDefaultValues,
    useFormSubmit,
} from '../useVoicePreferencesForm'
import {getVoiceMessagePayload} from '../utils'

const queryClient = mockQueryClient()

jest.mock('@gorgias/api-client')
const updatePhoneSettingsMock = assumeMock(updatePhoneSettings)

jest.mock('hooks/useAppDispatch')
const dispatchMock = jest.fn()
assumeMock(useAppDispatch).mockReturnValue(dispatchMock)

jest.mock('state/notifications/actions')
const notifyMock = assumeMock(notify)

jest.mock('../utils')
assumeMock(getVoiceMessagePayload).mockReturnValue(
    'recordingNotificationPayload' as any
)

jest.mock('state/integrations/actions')
const fetchIntegrationsMock = assumeMock(fetchIntegrations)

const mockMethods = {
    control: jest.fn(),
    register: jest.fn(),
    handleSubmit: jest.fn(),
    setValue: jest.fn(),
    formState: {
        isDirty: false,
        isValid: true,
        dirtyFields: {},
    },
    watch: jest.fn(),
    reset: jest.fn(),
} as unknown as ReturnType<typeof useFormContext>

jest.mock('react-hook-form')
const useFormContextMock = assumeMock(useFormContext)

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone
) as unknown as PhoneIntegration

describe('hooks', () => {
    describe('useFormSubmit', () => {
        const render = () =>
            renderHook(({integration}) => useFormSubmit(integration), {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
                initialProps: {integration: phoneIntegration},
            })

        it('should call update with full payload', async () => {
            updatePhoneSettingsMock.mockReturnValue(
                Promise.resolve({} as HttpResponse<void>)
            )

            const {result, waitFor} = render()

            result.current.onSubmit({
                name: 'new name',
                meta: {
                    emoji: 'new emoji',
                    phone_team_id: 2,
                    preferences: {test: 'test', record_inbound_calls: true},
                    recording_notification: true,
                },
            } as any)

            await waitFor(() => {
                expect(updatePhoneSettingsMock).toHaveBeenCalledWith(
                    phoneIntegration.id,
                    {
                        name: 'new name',
                        emoji: 'new emoji',
                        phone_team_id: 2,
                        preferences: {test: 'test', record_inbound_calls: true},
                        recording_notification: 'recordingNotificationPayload',
                    },
                    undefined
                )
            })

            expect(notifyMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.Success,
                })
            )
            expect(fetchIntegrationsMock).toHaveBeenCalled()
        })

        it('should not send recording notification if recording is not enabled', async () => {
            updatePhoneSettingsMock.mockReturnValue(
                Promise.resolve({} as HttpResponse<void>)
            )

            const {result, waitFor} = render()

            result.current.onSubmit({
                name: 'new name',
                meta: {
                    emoji: 'new emoji',
                    phone_team_id: 2,
                    preferences: {test: 'test', record_inbound_calls: false},
                    recording_notification: {},
                },
            } as any)

            await waitFor(() => {
                expect(updatePhoneSettingsMock).toHaveBeenCalledWith(
                    phoneIntegration.id,
                    {
                        name: 'new name',
                        emoji: 'new emoji',
                        phone_team_id: 2,
                        preferences: {
                            test: 'test',
                            record_inbound_calls: false,
                        },
                    },
                    undefined
                )
            })
        })

        it('should dispatch error notification on error', async () => {
            updatePhoneSettingsMock.mockRejectedValue('An error occurred')

            const {result, waitFor} = render()

            result.current.onSubmit({
                name: 'new name',
                meta: {
                    emoji: 'new emoji',
                    phone_team_id: 2,
                    preferences: {test: 'test', record_inbound_calls: true},
                    recording_notification: true,
                },
            } as any)

            await waitFor(() => {
                expect(dispatchMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: UPDATE_INTEGRATION_ERROR,
                    })
                )
            })
        })
    })

    describe('useVoicePreferencesForm', () => {
        const render = () =>
            renderHook(
                ({integration}) => useVoicePreferencesForm(integration),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                    initialProps: {integration: phoneIntegration},
                }
            )

        beforeEach(() => {
            useFormContextMock.mockReturnValue(mockMethods)
        })

        it('should reset form values only when integration changes', () => {
            const {rerender} = render()

            expect(mockMethods.reset).toHaveBeenCalledTimes(1)

            rerender()

            expect(mockMethods.reset).toHaveBeenCalledTimes(1)

            rerender({
                integration: {...phoneIntegration, name: 'new name'} as any,
            })

            expect(mockMethods.reset).toHaveBeenCalledTimes(2)
        })
    })
})

describe('getDefaultValues', () => {
    it('should return default values for form', () => {
        const baseIntegration = {
            name: 'name',
            meta: {
                preferences: {},
            },
        }
        const values = getDefaultValues(baseIntegration as PhoneIntegration)

        expect(values).toEqual({
            name: 'name',
            meta: {
                preferences: {
                    record_inbound_calls: false,
                    record_outbound_calls: false,
                    ring_time: RING_TIME_DEFAULT_VALUE,
                    transcribe: DEFAULT_TRANSCRIBE_PREFERENCES,
                    voicemail_outside_business_hours: false,
                    wait_time: DEFAULT_WAIT_TIME_PREFERENCES,
                },
                recording_notification: DEFAULT_RECORDING_NOTIFICATION,
            },
        })
    })

    it('should return actual values instead of default ones when they are defined', () => {
        const baseIntegration = {
            name: 'name',
            meta: {
                preferences: {
                    record_inbound_calls: true,
                    record_outbound_calls: true,
                    ring_time: 10,
                    transcribe: {voicemails: true, recordings: false},
                    voicemail_outside_business_hours: true,
                    wait_time: {enabled: true, value: 20},
                },
                recording_notification: {
                    voice_message_type: VoiceMessageType.TextToSpeech,
                },
            },
        }
        const values = getDefaultValues(baseIntegration as PhoneIntegration)

        expect(values).toEqual({
            name: 'name',
            meta: {
                preferences: {
                    record_inbound_calls: true,
                    record_outbound_calls: true,
                    ring_time: 10,
                    transcribe: {voicemails: true, recordings: false},
                    voicemail_outside_business_hours: true,
                    wait_time: {enabled: true, value: 20},
                },
                recording_notification: {
                    voice_message_type: VoiceMessageType.TextToSpeech,
                    text_to_speech_content:
                        DEFAULT_RECORDING_NOTIFICATION.text_to_speech_content,
                },
            },
        })
    })
})
