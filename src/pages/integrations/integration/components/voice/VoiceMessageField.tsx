import React, {useState, useEffect, useCallback} from 'react'

import {
    MAX_VOICE_RECORDING_FILE_SIZE_MB,
    TEXT_TO_SPEECH_MAX_LENGTH,
} from 'models/integration/constants'
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
    isDisabled?: boolean
}

const VoiceMessageField = ({
    value,
    onChange,
    allowNone,
    maxRecordingDuration,
    horizontal = false,
    radioButtonId = '',
    isDisabled = false,
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
                MAX_VOICE_RECORDING_FILE_SIZE_MB,
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
                    <TextToSpeechRadioButton
                        selectedVoiceMessageType={value.voice_message_type}
                        onChange={handleVoiceMessageTypeChange}
                        id={radioButtonId}
                        isDisabled={isDisabled}
                    />
                    <CustomRecordingRadioButton
                        selectedVoiceMessageType={value.voice_message_type}
                        onChange={handleVoiceMessageTypeChange}
                        id={radioButtonId}
                        isDisabled={isDisabled}
                    />
                    {allowNone && (
                        <NoneRadioButton
                            selectedVoiceMessageType={value.voice_message_type}
                            onChange={handleVoiceMessageTypeChange}
                            id={radioButtonId}
                            isDisabled={isDisabled}
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
                        maxSizeInMB={MAX_VOICE_RECORDING_FILE_SIZE_MB}
                        isDisabled={isDisabled}
                    />
                )}
                {value.voice_message_type === VoiceMessageType.TextToSpeech && (
                    <TextToSpeechRecordingInput
                        onChange={onChange}
                        selectedValue={value}
                        className={css.optionContentHorizontal}
                        isDisabled={isDisabled}
                    />
                )}
            </>
        )
    }

    return (
        <>
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
            <CustomRecordingRadioButton
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
                    maxSizeInMB={MAX_VOICE_RECORDING_FILE_SIZE_MB}
                    isDisabled={isDisabled}
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
    isDisabled?: boolean
}

const NoneRadioButton = ({
    selectedVoiceMessageType,
    onChange,
    label = 'None',
    id = '',
    isDisabled = false,
}: VoiceMessageRadioButtonProps) => {
    return (
        <RadioButton
            className={css.radioButtonOption}
            label={label}
            value={VoiceMessageType.None}
            isSelected={selectedVoiceMessageType === VoiceMessageType.None}
            onChange={onChange}
            id={`${id}${VoiceMessageType.None}`}
            isDisabled={isDisabled}
        />
    )
}

const TextToSpeechRadioButton = ({
    selectedVoiceMessageType,
    onChange,
    label = 'Text-to-speech',
    id = '',
    isDisabled = false,
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
            isDisabled={isDisabled}
        />
    )
}

const CustomRecordingRadioButton = ({
    selectedVoiceMessageType,
    onChange,
    label = 'Custom recording',
    caption = '',
    id = '',
    isDisabled = false,
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
            isDisabled={isDisabled}
        />
    )
}

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

export default VoiceMessageField
