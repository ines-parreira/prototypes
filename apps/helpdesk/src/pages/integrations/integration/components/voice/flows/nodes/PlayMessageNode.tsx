import { useMemo } from 'react'

import { useWatch } from 'react-hook-form'

import { VoiceMessageType } from '@gorgias/helpdesk-queries'
import { CustomRecordingType, PlayMessageStep } from '@gorgias/helpdesk-types'
import { validateVoiceMessage } from '@gorgias/helpdesk-validators'

import { FormField } from 'core/forms'
import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'

import VoiceMessageField from '../../VoiceMessageField'
import { VoiceStepNode } from './VoiceStepNode'

export function PlayMessageNode({ data }: { data: PlayMessageStep }) {
    const { id } = data
    const step = useWatch({ name: `steps.${id}` })

    const { message } = step
    const description =
        message.voice_message_type === 'text_to_speech'
            ? message.text_to_speech_content || 'Message'
            : 'Custom recording'

    // Custom validation of the step
    const errors = useMemo(() => {
        const validation = validateVoiceMessage(message)
        return !validation.isValid
            ? message.voice_message_type === VoiceMessageType.TextToSpeech
                ? ['Text-to-speech message is required']
                : ['Recording is required']
            : []
    }, [message])

    return (
        <VoiceStepNode
            title="Play Message"
            description={description}
            icon={
                <StepCardIcon backgroundColor="blue" name="media-play-circle" />
            }
            errors={errors}
        >
            <div>
                <FormField
                    name={`steps.${id}.message`}
                    field={VoiceMessageField}
                    allowNone={false}
                    horizontal={true}
                    shouldUpload={true}
                    customRecordingType={CustomRecordingType.GreetingMessage}
                    radioButtonId={id}
                />
            </div>
        </VoiceStepNode>
    )
}
