import {
    PhoneIntegration,
    useUpdateAllPhoneSettings,
} from '@gorgias/helpdesk-queries'
import { CallRoutingFlow } from '@gorgias/helpdesk-types'

import { useNotify } from 'hooks/useNotify'

import { VoiceFlowNodeType } from '../constants'

export function useVoiceFlowForm(integration: PhoneIntegration) {
    const notify = useNotify()

    const getDefaultValues = (): CallRoutingFlow => {
        // todo get actual formData
        return {
            first_step_id: 'start',
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

    const onSubmit = (data: CallRoutingFlow) => {
        updateAllPhoneSettings({
            integrationId: integration.id,
            data: { meta: { flow: data } },
        })
    }

    return {
        getDefaultValues,
        onSubmit,
    }
}
