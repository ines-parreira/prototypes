import { appQueryClient } from '@repo/api-resources'
import { renderHook } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockPhoneIntegration,
    mockUpdateAllPhoneSettingsHandler,
} from '@gorgias/helpdesk-mocks'
import type { PhoneIntegration } from '@gorgias/helpdesk-queries'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { CallRoutingFlow } from '@gorgias/helpdesk-types'

import { DEFAULT_CALLBACK_REQUESTS } from 'models/integration/constants'

import { VoiceFlowNodeType } from '../../constants'
import type { VoiceFlowFormValues } from '../../types'
import { useVoiceFlowForm } from '../useVoiceFlowForm'

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

    beforeEach(() => {
        server.use(mockUseUpdateAllPhoneSettings.handler)
    })

    afterEach(() => {
        server.resetHandlers()
    })

    describe('getDefaultValues', () => {
        it('getDefaultValues should return empty CallRoutingFlow values', () => {
            const { result } = renderHook(() =>
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
            const { result } = renderHook(() =>
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
            const { result } = renderHook(() =>
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

        it('should show success notification on successful save and refresh', async () => {
            const refetchQueriesSpy = jest.spyOn(
                appQueryClient,
                'refetchQueries',
            )

            const { result } = renderHook(() =>
                useVoiceFlowForm(mockIntegration),
            )

            act(() => {
                result.current.onSubmit(flowData)
            })

            const toastEl = await screen.findByRole('status', {
                name: 'Changes to your Call Flow were successfully saved.',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')

            await waitFor(() => {
                expect(refetchQueriesSpy).toHaveBeenCalledWith(
                    queryKeys.integrations.getIntegration(mockIntegration.id),
                )
            })

            refetchQueriesSpy.mockRestore()
        })

        it('should show error notification on save failure', async () => {
            const mockUpdateWithErrorHandler =
                mockUpdateAllPhoneSettingsHandler(async () =>
                    HttpResponse.json(null, {
                        status: 500,
                    }),
                )
            server.use(mockUpdateWithErrorHandler.handler)

            const { result } = renderHook(() =>
                useVoiceFlowForm(mockIntegration),
            )

            act(() => {
                result.current.onSubmit(flowData)
            })

            const toastEl = await screen.findByRole('status', {
                name: 'Failed to save changes to your Call Flow.',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
