import { EnqueueStep, RouteToInternalNumber } from '@gorgias/helpdesk-types'
import { validateVoiceCallbackRequests } from '@gorgias/helpdesk-validators'

import { VoiceFlowNodeType } from '../constants'

export const validateRouteToStep = (
    step: RouteToInternalNumber | EnqueueStep,
): string[] => {
    const errors: string[] = []

    switch (step.step_type) {
        case VoiceFlowNodeType.Enqueue:
            if (!step?.queue_id) {
                errors.push('Queue is required')
            }
            if (step?.callback_requests?.enabled) {
                try {
                    if (
                        !validateVoiceCallbackRequests(step.callback_requests)
                            .isValid
                    ) {
                        errors.push('Callback settings are misconfigured')
                    }
                } catch {
                    errors.push('Callback settings are misconfigured')
                }
            }
            break
        case VoiceFlowNodeType.RouteToInternalNumber:
            if (!step?.integration_id) {
                errors.push('Integration is required')
            }
            break
    }

    return errors
}
