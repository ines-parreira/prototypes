import cloneDeep from 'lodash/cloneDeep'
import { v4 as uuidv4 } from 'uuid'

import {
    CallRoutingFlow,
    EnqueueStep,
    TimeSplitConditionalStep,
} from '@gorgias/helpdesk-types'

import { DEFAULT_CALLBACK_REQUESTS } from 'models/integration/constants'

import { VOICEMAIL_FLOW_STEP } from './constants'

export const getSendToVoicemailFlow = (): CallRoutingFlow => {
    const voicemailUuid = uuidv4()
    return {
        first_step_id: voicemailUuid,
        steps: {
            [voicemailUuid]: {
                ...VOICEMAIL_FLOW_STEP,
                id: voicemailUuid,
            },
        },
    }
}

export const getRouteToQueueFlow = (queue_id: number): CallRoutingFlow => {
    const voicemailUuid = uuidv4()
    const businessHoursUuid = uuidv4()
    const enqueueUuid = uuidv4()

    return {
        first_step_id: businessHoursUuid,
        steps: {
            [businessHoursUuid]: {
                id: businessHoursUuid,
                name: 'Business Hours',
                step_type: 'time_split_conditional',
                on_true_step_id: enqueueUuid,
                on_false_step_id: voicemailUuid,
            } as TimeSplitConditionalStep,
            [enqueueUuid]: {
                id: enqueueUuid,
                name: 'Enqueue',
                step_type: 'enqueue',
                queue_id,
                conditional_routing: false,
                callback_requests: cloneDeep(DEFAULT_CALLBACK_REQUESTS),
                next_step_id: voicemailUuid,
            } as EnqueueStep,
            [voicemailUuid]: { ...VOICEMAIL_FLOW_STEP, id: voicemailUuid },
        },
    }
}

export const getDefaultStandardFlow = (
    queue_id?: number | null,
): CallRoutingFlow => {
    if (!queue_id) {
        return getSendToVoicemailFlow()
    }

    return getRouteToQueueFlow(queue_id)
}

export const getDefaultIvrFlow = (): CallRoutingFlow => {
    const businessHoursUuid = uuidv4()
    const ivrMenuUuid = uuidv4()
    const ivrInstructions1Uuid = uuidv4()
    const ivrInstructions2Uuid = uuidv4()
    const voicemailUuid = uuidv4()

    return {
        first_step_id: businessHoursUuid,
        steps: {
            [businessHoursUuid]: {
                id: businessHoursUuid,
                name: 'Business Hours',
                step_type: 'time_split_conditional',
                on_true_step_id: ivrMenuUuid,
                on_false_step_id: voicemailUuid,
            },
            [ivrMenuUuid]: {
                id: ivrMenuUuid,
                name: 'IVR Menu',
                step_type: 'ivr_menu',
                message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content:
                        'Hello, thanks for calling. This IVR number was not fully configured. Press 1 for set up instructions. Press 2 for more.',
                },
                branch_options: [
                    {
                        input_digit: '1',
                        branch_name: 'IVR 1 instructions',
                        next_step_id: ivrInstructions1Uuid,
                    },
                    {
                        input_digit: '2',
                        branch_name: 'IVR 2 instructions',
                        next_step_id: ivrInstructions2Uuid,
                    },
                ],
            },
            [ivrInstructions1Uuid]: {
                id: ivrInstructions1Uuid,
                name: 'IVR instructions (1)',
                step_type: 'play_message',
                message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content:
                        'You can update IVR menu options on the Call flow page.',
                },
                next_step_id: null,
            },
            [ivrInstructions2Uuid]: {
                id: ivrInstructions2Uuid,
                name: 'IVR instructions (2)',
                step_type: 'play_message',
                message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content:
                        'By default, the call will go to voicemail outside business hours.',
                },
                next_step_id: null,
            },
            [voicemailUuid]: { ...VOICEMAIL_FLOW_STEP, id: voicemailUuid },
        },
    }
}
