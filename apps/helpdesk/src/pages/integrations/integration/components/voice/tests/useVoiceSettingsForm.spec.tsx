import { assumeMock, renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Router } from 'react-router-dom'

import {
    mockDeleteIntegrationHandler,
    mockUpdateAllPhoneSettingsHandler,
} from '@gorgias/helpdesk-mocks'
import type { PhoneIntegration } from '@gorgias/helpdesk-queries'
import { IntegrationType, VoiceMessageType } from '@gorgias/helpdesk-types'

import { integrationsState } from 'fixtures/integrations'
import { useAppDispatch } from 'hooks/useAppDispatch'
import {
    DEFAULT_CALLBACK_REQUESTS,
    DEFAULT_GREETING_MESSAGE,
    DEFAULT_RECORDING_NOTIFICATION,
    VOICEMAIL_DEFAULT_VOICE_MESSAGE,
} from 'models/integration/constants'
import { fetchIntegrations } from 'state/integrations/actions'
import {
    DELETE_INTEGRATION_SUCCESS,
    UPDATE_INTEGRATION_ERROR,
} from 'state/integrations/constants'

import { DEFAULT_TRANSCRIBE_PREFERENCES } from '../constants'
import {
    getDefaultValues,
    useDeletePhoneIntegration,
    useFormSubmit,
} from '../useVoiceSettingsForm'
import {
    DEFAULT_TTS_GENDER,
    DEFAULT_TTS_LANGUAGE,
} from '../VoiceMessageTTS/constants'

const updateAllPhoneSettingsRequests: Request[] = []
const server = setupServer()

jest.mock('hooks/useAppDispatch')
const dispatchMock = jest.fn()
assumeMock(useAppDispatch).mockReturnValue(dispatchMock)

jest.mock('state/integrations/actions')
const fetchIntegrationsMock = assumeMock(fetchIntegrations)

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone,
) as unknown as PhoneIntegration

describe('hooks', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        updateAllPhoneSettingsRequests.length = 0
        server.use(
            mockUpdateAllPhoneSettingsHandler(async ({ request }) => {
                updateAllPhoneSettingsRequests.push(request)

                return new HttpResponse(null, { status: 204 })
            }).handler,
            mockDeleteIntegrationHandler(
                async () => new HttpResponse(null, { status: 204 }),
            ).handler,
        )
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    describe('useFormSubmit', () => {
        const render = () =>
            renderHook(({ integration }) => useFormSubmit(integration), {
                initialProps: { integration: phoneIntegration },
            })

        it('should call update with full payload', async () => {
            const { result } = render()
            const submittableData = {
                name: 'new name',
                meta: {
                    emoji: 'new emoji',
                    phone_team_id: 2,
                    preferences: { test: 'test', record_inbound_calls: true },
                    recording_notification: true,
                    callback_requests: {
                        ...DEFAULT_CALLBACK_REQUESTS,
                        enabled: true,
                    },
                },
            } as any

            result.current.onSubmit(submittableData)

            await waitFor(() => {
                expect(updateAllPhoneSettingsRequests).toHaveLength(1)
            })
            await expect(
                updateAllPhoneSettingsRequests[0].json(),
            ).resolves.toEqual(submittableData)

            const toastEl = await screen.findByRole('status', {
                name: 'Integration settings successfully updated.',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')
            expect(fetchIntegrationsMock).toHaveBeenCalled()
        })

        it('should call exclude recording notification changes if disabled', async () => {
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
                expect(updateAllPhoneSettingsRequests).toHaveLength(1)
            })
            await expect(
                updateAllPhoneSettingsRequests[0].json(),
            ).resolves.toEqual({
                ...submittableData,
                meta: {
                    ...submittableData.meta,
                    recording_notification: undefined,
                },
            })

            const toastEl = await screen.findByRole('status', {
                name: 'Integration settings successfully updated.',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')
            expect(fetchIntegrationsMock).toHaveBeenCalled()
        })

        it('should dispatch error notification on error', async () => {
            server.use(
                mockUpdateAllPhoneSettingsHandler(
                    async () => new HttpResponse(null, { status: 500 }),
                ).handler,
            )

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
                            {children}
                        </Router>
                    ),
                    initialProps: { integration: phoneIntegration },
                },
            )

        it('should call delete with correct id', async () => {
            const { result } = render()
            result.current.performDelete({ id: phoneIntegration.id })

            await waitFor(() => {
                expect(dispatchMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: DELETE_INTEGRATION_SUCCESS,
                    }),
                )
            })

            const toastEl = await screen.findByRole('status', {
                name: 'Integration successfully deleted',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')
        })

        it('should dispatch error notification on error', async () => {
            server.use(
                mockDeleteIntegrationHandler(
                    async () => new HttpResponse(null, { status: 500 }),
                ).handler,
            )

            const { result } = render()

            result.current.performDelete({ id: phoneIntegration.id })

            const toastEl = await screen.findByRole('status', {
                name: 'Failed to delete integration',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })
})

describe('getDefaultValues', () => {
    it('should return default values for form', () => {
        const baseIntegration = {
            name: 'name',
            business_hours_id: null,
            meta: {
                preferences: {},
            },
        }
        const values = getDefaultValues(baseIntegration as PhoneIntegration)

        expect(values).toEqual({
            name: 'name',
            business_hours_id: null,
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
                callback_requests: {
                    ...DEFAULT_CALLBACK_REQUESTS,
                },
            },
        })
    })

    it('should return actual values instead of default ones when they are defined', () => {
        const baseIntegration = {
            name: 'name',
            business_hours_id: 1,
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
                callback_requests: {
                    enabled: true,
                    prompt_message: {
                        voice_message_type: VoiceMessageType.TextToSpeech,
                        text_to_speech_content: `Test prompt message`,
                    },
                    confirmation_message: {
                        voice_message_type: VoiceMessageType.TextToSpeech,
                        text_to_speech_content: `Test confirmation message`,
                    },
                    allow_to_leave_voicemail: false,
                },
            },
        }
        const values = getDefaultValues(baseIntegration as PhoneIntegration)

        expect(values).toEqual({
            name: 'name',
            business_hours_id: 1,
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
                    gender: DEFAULT_TTS_GENDER,
                    language: DEFAULT_TTS_LANGUAGE,
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
                callback_requests: {
                    enabled: true,
                    prompt_message: {
                        voice_message_type: VoiceMessageType.TextToSpeech,
                        text_to_speech_content: `Test prompt message`,
                        language: DEFAULT_TTS_LANGUAGE,
                        gender: DEFAULT_TTS_GENDER,
                    },
                    confirmation_message: {
                        voice_message_type: VoiceMessageType.TextToSpeech,
                        text_to_speech_content: `Test confirmation message`,
                        language: DEFAULT_TTS_LANGUAGE,
                        gender: DEFAULT_TTS_GENDER,
                    },
                    allow_to_leave_voicemail: false,
                },
            },
        })
    })
})
