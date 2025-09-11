import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockPhoneIntegration,
    mockUpdateAllPhoneSettingsHandler,
} from '@gorgias/helpdesk-mocks'
import { PhoneIntegration } from '@gorgias/helpdesk-queries'
import { CallRoutingFlow } from '@gorgias/helpdesk-types'

import { useNotify } from 'hooks/useNotify'
import { DEFAULT_CALLBACK_REQUESTS } from 'models/integration/constants'
import { renderHookWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { VoiceFlowNodeType } from '../../constants'
import { VoiceFlowFormValues } from '../../types'
import { useVoiceFlowForm } from '../useVoiceFlowForm'

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(),
}))
const mockUseNotify = useNotify as jest.Mock

const server = setupServer()
beforeAll(() => {
    server.listen()
})

afterAll(() => {
    server.close()
})

const mockUseUpdateAllPhoneSettings = mockUpdateAllPhoneSettingsHandler()

describe('useVoiceFlowForm', () => {
    const mockIntegration = mockPhoneIntegration()
    const mockNotifySuccess = jest.fn()
    const mockNotifyError = jest.fn()

    beforeEach(() => {
        mockUseNotify.mockReturnValue({
            success: mockNotifySuccess,
            error: mockNotifyError,
        })
        server.use(mockUseUpdateAllPhoneSettings.handler)
    })

    afterEach(() => {
        server.resetHandlers()
    })

    describe('getDefaultValues', () => {
        it('getDefaultValues should return empty CallRoutingFlow values', () => {
            const { result } = renderHookWithQueryClientProvider(() =>
                useVoiceFlowForm(mockIntegration),
            )

            const defaultValues = result.current.getDefaultValues()

            expect(defaultValues).toEqual({
                business_hours_id: mockIntegration.business_hours_id,
                first_step_id: '',
                record_inbound_calls:
                    mockIntegration.meta.preferences?.record_inbound_calls,
                steps: {},
            })
        })

        it('getDefaultValues should return default record_inbound_calls', () => {
            const { result } = renderHookWithQueryClientProvider(() =>
                useVoiceFlowForm({
                    ...mockIntegration,
                    meta: {},
                } as PhoneIntegration),
            )

            const defaultValues = result.current.getDefaultValues()

            expect(defaultValues).toEqual({
                business_hours_id: mockIntegration.business_hours_id,
                first_step_id: '',
                record_inbound_calls: false,
                steps: {},
            })
        })

        it('getDefaultValues should add defaults for enqueue step', () => {
            const { result } = renderHookWithQueryClientProvider(() =>
                useVoiceFlowForm(mockIntegration),
            )

            const values = {
                business_hours_id: 2,
                first_step_id: 'step-1',
                steps: {
                    'step-1': {
                        id: 'step-1',
                        step_type: VoiceFlowNodeType.PlayMessage,
                        name: 'Step 1',
                        message: {
                            voice_message_type: 'text_to_speech',
                            text_to_speech_content: 'Hello, this is step 1',
                        },
                        next_step_id: 'step-2',
                    },
                    'step-2': {
                        id: 'step-2',
                        step_type: VoiceFlowNodeType.Enqueue,
                        name: 'Step 2',
                        queue_id: 123,
                        next_step_id: null,
                    },
                },
            } as VoiceFlowFormValues
            const defaultValues = result.current.getDefaultValues(values)

            expect(defaultValues).toEqual({
                ...values,
                steps: {
                    ...values.steps,
                    'step-2': {
                        ...values.steps['step-2'],
                        callback_requests: {
                            ...DEFAULT_CALLBACK_REQUESTS,
                        },
                        conditional_routing: false,
                    },
                },
            })
        })
    })

    describe('onSubmit', () => {
        const flowData: CallRoutingFlow = {
            first_step_id: 'custom-start',
            steps: {
                'custom-step': {
                    id: 'custom-step',
                    step_type: VoiceFlowNodeType.PlayMessage,
                    name: 'Custom Step',
                    message: {
                        voice_message_type: 'text_to_speech',
                        text_to_speech_content: 'Custom message',
                    },
                    next_step_id: null,
                },
            },
        }

        it('should show success notification on successful save', async () => {
            const { result } = renderHookWithQueryClientProvider(() =>
                useVoiceFlowForm(mockIntegration),
            )

            act(() => {
                result.current.onSubmit(flowData)
            })

            await waitFor(() => {
                expect(mockNotifySuccess).toHaveBeenCalledWith(
                    'Changes to your Call Flow were successfully saved.',
                )
            })
        })

        it('should show error notification on save failure', async () => {
            const mockUpdateWithErrorHandler =
                mockUpdateAllPhoneSettingsHandler(async () =>
                    HttpResponse.json(null, {
                        status: 500,
                    }),
                )
            server.use(mockUpdateWithErrorHandler.handler)

            const { result } = renderHookWithQueryClientProvider(() =>
                useVoiceFlowForm(mockIntegration),
            )

            act(() => {
                result.current.onSubmit(flowData)
            })

            await waitFor(() => {
                expect(mockNotifyError).toHaveBeenCalledWith(
                    'Failed to save changes to your Call Flow.',
                )
            })
        })
    })
})
