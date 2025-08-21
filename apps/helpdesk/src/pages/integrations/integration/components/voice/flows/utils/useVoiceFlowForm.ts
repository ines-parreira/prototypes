import omit from 'lodash/omit'

import {
    PhoneIntegration,
    useUpdateAllPhoneSettings,
} from '@gorgias/helpdesk-queries'

import { useNotify } from 'hooks/useNotify'

import { VoiceFlowNodeType } from '../constants'
import { VoiceFlowFormValues } from '../types'

export function useVoiceFlowForm(integration: PhoneIntegration) {
    const notify = useNotify()

    const getDefaultValues = (): VoiceFlowFormValues => {
        // todo get actual formData
        return {
            business_hours_id: integration.business_hours_id ?? null,
            first_step_id: 'time-rule',
            steps: {
                'play-message': {
                    id: 'play-message',
                    step_type: VoiceFlowNodeType.PlayMessage,
                    name: 'Play Message',
                    message: {
                        voice_message_type: 'text_to_speech',
                        text_to_speech_content:
                            'Hello, this is a test message.',
                    },
                    next_step_id: null,
                },
                'time-rule': {
                    id: 'time-rule',
                    step_type: VoiceFlowNodeType.TimeSplitConditional,
                    name: 'Time Rule',
                    rule_type: 'business_hours',
                    on_true_step_id: 'play-message',
                    on_false_step_id: 'send-to-voicemail',
                },
                'send-to-voicemail': {
                    id: 'send-to-voicemail',
                    step_type: VoiceFlowNodeType.SendToVoicemail,
                    name: 'Send to Voicemail',
                    voicemail: {
                        voice_message_type: 'text_to_speech',
                        text_to_speech_content:
                            'Please leave a message after the beep.',
                    },
                    allow_to_leave_voicemail: true,
                },
            },
        }
    }

    const { mutate: updateAllPhoneSettings } = useUpdateAllPhoneSettings({
        mutation: {
            onSuccess: () => {
                void notify.success(
                    'Changes to your Call Flow were successfully saved.',
                )
            },
            onError: () => {
                void notify.error('Failed to save changes to your Call Flow.')
            },
        },
    })

    const onSubmit = (data: VoiceFlowFormValues) => {
        updateAllPhoneSettings({
            integrationId: integration.id,
            data: { meta: { flow: omit(data, ['business_hours_id']) } },
        })
    }

    return {
        getDefaultValues,
        onSubmit,
    }
}
