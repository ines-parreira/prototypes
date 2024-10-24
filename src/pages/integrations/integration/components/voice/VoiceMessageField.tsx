import React, {useState, useEffect, useCallback} from 'react'

import {TEXT_TO_SPEECH_MAX_LENGTH} from 'models/integration/constants'
import {
    VoiceMessage,
    VoiceMessageRecording,
    VoiceMessageTextToSpeech,
    VoiceMessageType,
} from 'models/integration/types'
import RadioButton from 'pages/common/components/RadioButton'
import Textarea from 'pages/common/forms/TextArea'
import {countLines} from 'utils/string'

import useVoiceMessageValidation from './hooks/useVoiceMessageValidation'

import css from './VoiceMessageField.less'
import VoiceRecordingInput from './VoiceRecordingInput'

type Props = {
    value: VoiceMessage
    onChange: (value: VoiceMessage) => void
    allowNone?: boolean
    maxRecordingDuration?: number
    horizontal?: boolean
    radioButtonId?: string
}

const VoiceMessageField = ({
    value,
    onChange,
    allowNone,
    maxRecordingDuration,
    horizontal = false,
    radioButtonId = '',
}: Props): JSX.Element => {
    const {validateVoiceRecordingUpload} = useVoiceMessageValidation()
    const [voiceRecordingPath, setVoiceRecordingPath] = useState<
        string | undefined
    >()

    useEffect(() => {
        if (
            !voiceRecordingPath &&
            value?.voice_message_type === VoiceMessageType.VoiceRecording &&
            value?.voice_recording_file_path
        ) {
            setVoiceRecordingPath(value?.voice_recording_file_path)
        }
    }, [value, voiceRecordingPath, setVoiceRecordingPath])

    const handleVoiceMessageTypeChange = useCallback(
        (type) => {
            onChange({
                ...value,
                voice_message_type: type,
            })
        },
        [value, onChange]
    )

    const handleVoiceRecordingUpload = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const voiceRecordingUpload = await validateVoiceRecordingUpload(
                event,
                maxRecordingDuration,
                horizontal
            )
            if (voiceRecordingUpload) {
                const {url, newVoiceFields} = voiceRecordingUpload
                setVoiceRecordingPath(url)

                const newValue: VoiceMessageRecording = {
                    ...value,
                    ...newVoiceFields,
                    voice_message_type: VoiceMessageType.VoiceRecording,
                }
                onChange(newValue)
            }
        },
        [
            value,
            onChange,
            maxRecordingDuration,
            horizontal,
            validateVoiceRecordingUpload,
        ]
    )

    if (horizontal) {
        return (
            <>
                <div className={css.horizontalRadioButtons}>
                    <VoiceRecordingRadioButton
                        selectedVoiceMessageType={value.voice_message_type}
                        onChange={handleVoiceMessageTypeChange}
                        label={'Voice recording'}
                        caption={'Max 2MB, mp3 only'}
                        id={radioButtonId}
                    />
                    <TextToSpeechRadioButton
                        selectedVoiceMessageType={value.voice_message_type}
                        onChange={handleVoiceMessageTypeChange}
                        id={radioButtonId}
                    />
                    {allowNone && (
                        <NoneRadioButton
                            selectedVoiceMessageType={value.voice_message_type}
                            onChange={handleVoiceMessageTypeChange}
                            id={radioButtonId}
                        />
                    )}
                </div>
                {value.voice_message_type ===
                    VoiceMessageType.VoiceRecording && (
                    <VoiceRecordingInput
                        voiceRecordingPath={voiceRecordingPath}
                        onVoiceRecordingUpload={handleVoiceRecordingUpload}
                        className={css.optionContentHorizontal}
                        replaceLabel={'Replace File'}
                        uploadLabel={'Upload File'}
                    />
                )}
                {value.voice_message_type === VoiceMessageType.TextToSpeech && (
                    <TextToSpeechRecordingInput
                        onChange={onChange}
                        selectedValue={value}
                        className={css.optionContentHorizontal}
                    />
                )}
            </>
        )
    }

    return (
        <>
            <VoiceRecordingRadioButton
                selectedVoiceMessageType={value.voice_message_type}
                onChange={handleVoiceMessageTypeChange}
                id={radioButtonId}
            />
            {value.voice_message_type === VoiceMessageType.VoiceRecording && (
                <VoiceRecordingInput
                    voiceRecordingPath={voiceRecordingPath}
                    onVoiceRecordingUpload={handleVoiceRecordingUpload}
                    replaceLabel={'Replace File'}
                    uploadLabel={'Upload File'}
                />
            )}
            <TextToSpeechRadioButton
                selectedVoiceMessageType={value.voice_message_type}
                onChange={handleVoiceMessageTypeChange}
                id={radioButtonId}
            />
            {value.voice_message_type === VoiceMessageType.TextToSpeech && (
                <TextToSpeechRecordingInput
                    onChange={onChange}
                    selectedValue={value}
                />
            )}
            {allowNone && (
                <NoneRadioButton
                    selectedVoiceMessageType={value.voice_message_type}
                    onChange={handleVoiceMessageTypeChange}
                    id={radioButtonId}
                />
            )}
        </>
    )
}

type VoiceMessageRadioButtonProps = {
    selectedVoiceMessageType: VoiceMessageType
    onChange: (value: string) => void
    label?: string
    caption?: string
    id?: string
}

const NoneRadioButton = ({
    selectedVoiceMessageType,
    onChange,
    label = 'None',
    id = '',
}: VoiceMessageRadioButtonProps) => {
    return (
        <RadioButton
            className={css.radioButtonOption}
            label={label}
            value={VoiceMessageType.None}
            isSelected={selectedVoiceMessageType === VoiceMessageType.None}
            onChange={onChange}
            id={`${id}${VoiceMessageType.None}`}
        />
    )
}

const TextToSpeechRadioButton = ({
    selectedVoiceMessageType,
    onChange,
    label = 'Text To Speech',
    id = '',
}: VoiceMessageRadioButtonProps) => {
    return (
        <RadioButton
            className={css.radioButtonOption}
            label={label}
            value={VoiceMessageType.TextToSpeech}
            isSelected={
                selectedVoiceMessageType === VoiceMessageType.TextToSpeech
            }
            onChange={onChange}
            id={`${id}${VoiceMessageType.TextToSpeech}`}
        />
    )
}

const VoiceRecordingRadioButton = ({
    selectedVoiceMessageType,
    onChange,
    label = 'Insert Voice Recording',
    caption = '',
    id = '',
}: VoiceMessageRadioButtonProps) => {
    return (
        <RadioButton
            className={css.radioButtonOption}
            label={label}
            value={VoiceMessageType.VoiceRecording}
            isSelected={
                selectedVoiceMessageType === VoiceMessageType.VoiceRecording
            }
            onChange={onChange}
            caption={caption}
            id={`${id}${VoiceMessageType.VoiceRecording}`}
        />
    )
}

type PropsTextToSpeechRecordingInput = {
    selectedValue: VoiceMessageTextToSpeech
    onChange: (value: VoiceMessage) => void
    className?: string
}

const TextToSpeechRecordingInput = ({
    selectedValue,
    onChange,
    className = css.optionContent,
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
                        ? 'Text To Speech message is required'
                        : ''
                }
            />
        </div>
    )
}

export default VoiceMessageField
