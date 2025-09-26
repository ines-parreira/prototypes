import React from 'react'

import { TEXT_TO_SPEECH_MAX_LENGTH } from 'models/integration/constants'
import {
    VoiceMessage,
    VoiceMessageTextToSpeech,
    VoiceMessageType,
} from 'models/integration/types'
import Textarea from 'pages/common/forms/TextArea'
import { countLines } from 'utils/string'

import css from './VoiceMessageField.less'

type PropsTextToSpeechRecordingInput = {
    selectedValue: VoiceMessageTextToSpeech
    onChange: (value: VoiceMessage) => void
    className?: string
    isDisabled?: boolean
}

const TextToSpeechRecordingInput = ({
    selectedValue,
    onChange,
    className = css.optionContent,
    isDisabled = false,
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
            />
        </div>
    )
}

export default TextToSpeechRecordingInput
