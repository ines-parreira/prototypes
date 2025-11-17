import { useMemo } from 'react'

import { useWatch } from 'react-hook-form'

import {
    LegacyBanner as Banner,
    LegacyCheckBoxField as CheckBoxField,
} from '@gorgias/axiom'
import { VoiceMessageType } from '@gorgias/helpdesk-queries'
import type { SendToVoicemailStep } from '@gorgias/helpdesk-types'
import { CustomRecordingType } from '@gorgias/helpdesk-types'
import { validateVoiceMessage } from '@gorgias/helpdesk-validators'

import { FormField } from 'core/forms'
import type { NodeProps } from 'core/ui/flows'
import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'

import VoiceMessageField from '../../VoiceMessageField'
import type { SendToVoicemailNode } from '../types'
import { VoiceStepNode } from './VoiceStepNode'

export function SendToVoicemailNode(props: NodeProps<SendToVoicemailNode>) {
    const { id } = props.data
    const step: SendToVoicemailStep | null = useWatch({ name: `steps.${id}` })

    const description =
        step?.voicemail?.voice_message_type === 'text_to_speech'
            ? step?.voicemail?.text_to_speech_content || 'Add voicemail'
            : 'Custom recording'

    // Custom validation of the step
    const errors = useMemo(() => {
        const validation = validateVoiceMessage(step?.voicemail)
        return !validation.isValid
            ? step?.voicemail?.voice_message_type ===
              VoiceMessageType.TextToSpeech
                ? ['Text-to-speech message is required']
                : ['Recording is required']
            : []
    }, [step?.voicemail])

    if (!step) {
        return null
    }

    return (
        <VoiceStepNode
            title="Voicemail"
            description={description}
            icon={
                <StepCardIcon backgroundColor="yellow" name="comm-voicemail" />
            }
            errors={errors}
            {...props}
        >
            <Banner type="info">
                Voicemail is a final step, you cannot add any other steps after.
                Once the caller leaves a voicemail, the call ends.
            </Banner>
            <div>
                <FormField
                    name={`steps.${id}.voicemail`}
                    field={VoiceMessageField}
                    customRecordingType={
                        CustomRecordingType.VoicemailNotification
                    }
                    label={'Message type'}
                />
            </div>
            <FormField
                name={`steps.${id}.allow_to_leave_voicemail`}
                field={CheckBoxField}
                label={'Allow caller to leave a voicemail'}
                caption={
                    'When selected, callers will hear the voicemail greeting and can leave a message.'
                }
            />
        </VoiceStepNode>
    )
}
