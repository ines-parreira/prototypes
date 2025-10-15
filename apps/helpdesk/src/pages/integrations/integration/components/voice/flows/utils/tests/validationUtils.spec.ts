import { assumeMock } from '@repo/testing'

import {
    mockEnqueueStep,
    mockRouteToInternalNumber,
    mockVoiceCallbackRequests,
} from '@gorgias/helpdesk-mocks'
import { validateVoiceCallbackRequests } from '@gorgias/helpdesk-validators'

import { VoiceFlowNodeType } from '../../constants'
import { validateRouteToStep } from '../validationUtils'

jest.mock('@gorgias/helpdesk-validators')
const validateVoiceCallbackRequestsMock = assumeMock(
    validateVoiceCallbackRequests,
)

describe('validateRouteToStep', () => {
    beforeEach(() => {
        validateVoiceCallbackRequestsMock.mockReturnValue({
            isValid: true,
        } as any)
    })

    describe('Enqueue step validation', () => {
        it('should return no errors for valid enqueue step with queue_id', () => {
            const step = mockEnqueueStep({
                step_type: VoiceFlowNodeType.Enqueue,
                queue_id: 123,
            })

            const errors = validateRouteToStep(step)

            expect(errors).toEqual([])
        })

        it('should return error when queue_id is missing', () => {
            const step = mockEnqueueStep({
                step_type: VoiceFlowNodeType.Enqueue,
                queue_id: null!,
            })

            const errors = validateRouteToStep(step)

            expect(errors).toEqual(['Queue is required'])
        })

        it('should validate callback requests when enabled and valid', () => {
            validateVoiceCallbackRequestsMock.mockReturnValue({
                isValid: true,
            } as any)

            const step = mockEnqueueStep({
                step_type: VoiceFlowNodeType.Enqueue,
                queue_id: 123,
                callback_requests: mockVoiceCallbackRequests({
                    enabled: true,
                }),
            })

            const errors = validateRouteToStep(step)

            expect(validateVoiceCallbackRequestsMock).toHaveBeenCalledWith(
                step.callback_requests,
            )
            expect(errors).toEqual([])
        })

        it('should return error when callback requests are enabled but invalid', () => {
            validateVoiceCallbackRequestsMock.mockReturnValue({
                isValid: false,
            } as any)

            const step = mockEnqueueStep({
                step_type: VoiceFlowNodeType.Enqueue,
                queue_id: 123,
                callback_requests: mockVoiceCallbackRequests({
                    enabled: true,
                }),
            })

            const errors = validateRouteToStep(step)

            expect(validateVoiceCallbackRequestsMock).toHaveBeenCalledWith(
                step.callback_requests,
            )
            expect(errors).toEqual(['Callback settings are misconfigured'])
        })

        it('should not validate callback requests when disabled', () => {
            const step = mockEnqueueStep({
                step_type: VoiceFlowNodeType.Enqueue,
                queue_id: 123,
                callback_requests: mockVoiceCallbackRequests({
                    enabled: false,
                }),
            })

            const errors = validateRouteToStep(step)

            expect(validateVoiceCallbackRequestsMock).not.toHaveBeenCalled()
            expect(errors).toEqual([])
        })

        it('should return multiple errors when both queue_id is missing and callback validation fails', () => {
            validateVoiceCallbackRequestsMock.mockReturnValue({
                isValid: false,
            } as any)

            const step = mockEnqueueStep({
                step_type: VoiceFlowNodeType.Enqueue,
                queue_id: null!,
                callback_requests: mockVoiceCallbackRequests({
                    enabled: true,
                }),
            })

            const errors = validateRouteToStep(step)

            expect(errors).toEqual([
                'Queue is required',
                'Callback settings are misconfigured',
            ])
        })
    })

    describe('RouteToInternalNumber step validation', () => {
        it('should return no errors for valid route to internal number step', () => {
            const step = mockRouteToInternalNumber({
                step_type: VoiceFlowNodeType.RouteToInternalNumber,
                integration_id: 456,
            })

            const errors = validateRouteToStep(step)

            expect(errors).toEqual([])
        })

        it('should return error when integration_id is missing', () => {
            const step = mockRouteToInternalNumber({
                step_type: VoiceFlowNodeType.RouteToInternalNumber,
                integration_id: null!,
            })

            const errors = validateRouteToStep(step)

            expect(errors).toEqual(['Integration is required'])
        })
    })

    describe('Edge cases', () => {
        it('should return empty array for unknown step type', () => {
            const step = {
                step_type: 'unknown_step_type',
                some_property: 'value',
            }

            const errors = validateRouteToStep(step as any)

            expect(errors).toEqual([])
        })
    })
})
