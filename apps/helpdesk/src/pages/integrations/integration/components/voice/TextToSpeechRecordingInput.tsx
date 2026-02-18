import React from 'react'

import { countLines } from '@repo/utils'

import { TEXT_TO_SPEECH_MAX_LENGTH } from 'models/integration/constants'
import type {
    VoiceMessage,
    VoiceMessageTextToSpeech,
} from 'models/integration/types'
import { VoiceMessageType } from 'models/integration/types'
import Textarea from 'pages/common/forms/TextArea'

import css from './VoiceMessageField.less'

type PropsTextToSpeechRecordingInput = {
    selectedValue: VoiceMessageTextToSpeech
    onChange: (value: VoiceMessage) => void
    className?: string
    isDisabled?: boolean
    withLength?: boolean
}

const TextToSpeechRecordingInput = ({
    selectedValue,
    onChange,
    className = css.optionContent,
    isDisabled = false,
    withLength,
}: PropsTextToSpeechRecordingInput) => {
    const textToSpeechLines =
        selectedValue.voice_message_type === VoiceMessageType.TextToSpeech &&
        selectedValue.text_to_speech_content
            ? countLines(selectedValue.text_to_speech_content)
            : 0
    const value = selectedValue.text_to_speech_content ?? ''
    const noMessageProvided = value.length === 0

    return (
        <div className={className}>
            <Textarea
                className={css.textToSpeechTextarea}
                maxLength={TEXT_TO_SPEECH_MAX_LENGTH}
                value={value}
                onChange={(message) => {
                    onChange({
                        ...selectedValue,
                        text_to_speech_content: message,
                        text_to_speech_recording_file_path: null,
                    })
                }}
                rows={textToSpeechLines > 2 ? textToSpeechLines : 2}
                placeholder={'Write a message to convert to speech'}
                error={
                    noMessageProvided
                        ? 'Text-to-speech message is required'
                        : ''
                }
                isDisabled={isDisabled}
                caption={
                    withLength ? (
                        <div className={css.textareaCaption}>
                            {value.length} / {TEXT_TO_SPEECH_MAX_LENGTH}
                        </div>
                    ) : undefined
                }
            />
        </div>
    )
}

export default TextToSpeechRecordingInput
