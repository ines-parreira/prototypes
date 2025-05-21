import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import {
    deleteIntegration,
    HttpResponse,
    IntegrationType,
    PhoneIntegration,
    updateAllPhoneSettings,
    VoiceMessageType,
} from '@gorgias/api-client'

import { integrationsState } from 'fixtures/integrations'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    DEFAULT_GREETING_MESSAGE,
    DEFAULT_RECORDING_NOTIFICATION,
    VOICEMAIL_DEFAULT_VOICE_MESSAGE,
} from 'models/integration/constants'
import { fetchIntegrations } from 'state/integrations/actions'
import { UPDATE_INTEGRATION_ERROR } from 'state/integrations/constants'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { DEFAULT_TRANSCRIBE_PREFERENCES } from '../constants'
import {
    getDefaultValues,
    useDeletePhoneIntegration,
    useFormSubmit,
} from '../useVoiceSettingsForm'

const queryClient = mockQueryClient()

jest.mock('@gorgias/api-client')
const updateAllPhoneSettingsMock = assumeMock(updateAllPhoneSettings)
const deleteIntegrationMock = assumeMock(deleteIntegration)

jest.mock('hooks/useAppDispatch')
const dispatchMock = jest.fn()
assumeMock(useAppDispatch).mockReturnValue(dispatchMock)

const mockNotify = {
    success: jest.fn(),
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

jest.mock('state/integrations/actions')
const fetchIntegrationsMock = assumeMock(fetchIntegrations)

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone,
) as unknown as PhoneIntegration

describe('hooks', () => {
    describe('useFormSubmit', () => {
        const render = () =>
            renderHook(({ integration }) => useFormSubmit(integration), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
                initialProps: { integration: phoneIntegration },
            })

        it('should call update with full payload', async () => {
            updateAllPhoneSettingsMock.mockReturnValue(
                Promise.resolve({} as HttpResponse<void>),
            )

            const { result } = render()
            const submittableData = {
                name: 'new name',
                meta: {
                    emoji: 'new emoji',
                    phone_team_id: 2,
                    preferences: { test: 'test', record_inbound_calls: true },
                    recording_notification: true,
                },
            } as any

            result.current.onSubmit(submittableData)

            await waitFor(() => {
                expect(updateAllPhoneSettingsMock).toHaveBeenCalledWith(
                    phoneIntegration.id,
                    submittableData,
                    undefined,
                )
            })

            expect(mockNotify.success).toHaveBeenCalledWith(
                'Integration settings successfully updated.',
            )
            expect(fetchIntegrationsMock).toHaveBeenCalled()
        })

        it('should call exclude recording notification changes if disabled', async () => {
            updateAllPhoneSettingsMock.mockReturnValue(
                Promise.resolve({} as HttpResponse<void>),
            )

            const { result } = render()
            const submittableData = {
                name: 'new name',
                meta: {
                    emoji: 'new emoji',
                    phone_team_id: 2,
                    preferences: {
                        test: 'test',
                        record_inbound_calls: false,
                        record_outbound_calls: false,
                    },
                    recording_notification: {
                        voice_message_type: VoiceMessageType.None,
                    },
                },
            } as any

            result.current.onSubmit(submittableData)

            await waitFor(() => {
                expect(updateAllPhoneSettingsMock).toHaveBeenCalledWith(
                    phoneIntegration.id,
                    {
                        ...submittableData,
                        meta: {
                            ...submittableData.meta,
                            recording_notification: undefined,
                        },
                    },
                    undefined,
                )
            })

            expect(mockNotify.success).toHaveBeenCalledWith(
                'Integration settings successfully updated.',
            )
            expect(fetchIntegrationsMock).toHaveBeenCalled()
        })

        it('should dispatch error notification on error', async () => {
            updateAllPhoneSettingsMock.mockRejectedValue('An error occurred')

            const { result } = render()

            result.current.onSubmit({
                name: 'new name',
                meta: {
                    emoji: 'new emoji',
                    phone_team_id: 2,
                    preferences: { test: 'test', record_inbound_calls: true },
                    recording_notification: true,
                },
            } as any)

            await waitFor(() => {
                expect(dispatchMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: UPDATE_INTEGRATION_ERROR,
                    }),
                )
            })
        })
    })

    describe('useDeleteVoiceIntegration', () => {
        const render = () =>
            renderHook(
                ({ integration }) => useDeletePhoneIntegration(integration),
                {
                    wrapper: ({ children }) => (
                        <Router history={createMemoryHistory({})}>
                            <QueryClientProvider client={queryClient}>
                                {children}
                            </QueryClientProvider>
                        </Router>
                    ),
                    initialProps: { integration: phoneIntegration },
                },
            )

        it('should call delete with correct id', async () => {
            deleteIntegrationMock.mockReturnValue(
                Promise.resolve({} as HttpResponse<void>),
            )

            const { result } = render()
            result.current.performDelete({ id: phoneIntegration.id })

            await waitFor(() => {
                expect(deleteIntegrationMock).toHaveBeenCalled()
            })

            expect(mockNotify.success).toHaveBeenCalled()
        })

        it('should dispatch error notification on error', async () => {
            deleteIntegrationMock.mockRejectedValue('An error occurred')

            const { result } = render()

            result.current.performDelete({ id: phoneIntegration.id })

            await waitFor(() => {
                expect(mockNotify.error).toHaveBeenCalledWith(
                    'Failed to delete integration',
                )
            })
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
                    transcribe: DEFAULT_TRANSCRIBE_PREFERENCES,
                    voicemail_outside_business_hours: false,
                },
                send_calls_to_voicemail: false,
                recording_notification: DEFAULT_RECORDING_NOTIFICATION,
                greeting_message: DEFAULT_GREETING_MESSAGE,
                voicemail: {
                    ...VOICEMAIL_DEFAULT_VOICE_MESSAGE,
                    outside_business_hours: {
                        use_during_business_hours_settings: true,
                        ...VOICEMAIL_DEFAULT_VOICE_MESSAGE,
                    },
                },
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
                    transcribe: { voicemails: true, recordings: false },
                    voicemail_outside_business_hours: true,
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
                    transcribe: { voicemails: true, recordings: false },
                    voicemail_outside_business_hours: true,
                },
                recording_notification: {
                    voice_message_type: VoiceMessageType.TextToSpeech,
                    text_to_speech_content:
                        DEFAULT_RECORDING_NOTIFICATION.text_to_speech_content,
                },
                send_calls_to_voicemail: false,
                greeting_message: DEFAULT_GREETING_MESSAGE,
                voicemail: {
                    ...VOICEMAIL_DEFAULT_VOICE_MESSAGE,
                    outside_business_hours: {
                        use_during_business_hours_settings: true,
                        ...VOICEMAIL_DEFAULT_VOICE_MESSAGE,
                    },
                },
            },
        })
    })
})
