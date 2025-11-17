import { useMemo } from 'react'

import { useWatch } from 'react-hook-form'

import { Banner } from '@gorgias/axiom'
import { VoiceMessageType } from '@gorgias/helpdesk-queries'
import type { PlayMessageStep } from '@gorgias/helpdesk-types'
import { CustomRecordingType } from '@gorgias/helpdesk-types'
import { validateVoiceMessage } from '@gorgias/helpdesk-validators'

import { FormField } from 'core/forms'
import type { NodeProps } from 'core/ui/flows'
import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'

import VoiceMessageField from '../../VoiceMessageField'
import type { PlayMessageNode } from '../types'
import { VoiceStepNode } from './VoiceStepNode'

export function PlayMessageNode(props: NodeProps<PlayMessageNode>) {
    const { id } = props.data
    const recordInboundCalls = useWatch({ name: 'record_inbound_calls' })
    const step: PlayMessageStep | null = useWatch({ name: `steps.${id}` })

    const description =
        step?.message?.voice_message_type === 'text_to_speech'
            ? step?.message?.text_to_speech_content || 'Add message'
            : 'Custom recording'

    // Custom validation of the step
    const errors = useMemo(() => {
        const validation = validateVoiceMessage(step?.message)
        return !validation.isValid
            ? step?.message?.voice_message_type ===
              VoiceMessageType.TextToSpeech
                ? ['Text-to-speech message is required']
                : ['Recording is required']
            : []
    }, [step?.message])

    if (!step) {
        return null
    }

    return (
        <VoiceStepNode
            title="Play Message"
            description={description}
            icon={
                <StepCardIcon backgroundColor="blue" name="media-play-circle" />
            }
            errors={errors}
            {...props}
        >
            {recordInboundCalls && (
                <Banner type="info">
                    <span>
                        Call recording is enabled for inbound calls. To ensure
                        transparency, consider adding a recording notification
                        to your welcome message.
                    </span>
                </Banner>
            )}
            <div>
                <FormField
                    name={`steps.${id}.message`}
                    field={VoiceMessageField}
                    allowNone={false}
                    customRecordingType={CustomRecordingType.GreetingMessage}
                    label="Message type"
                />
            </div>
        </VoiceStepNode>
    )
}
