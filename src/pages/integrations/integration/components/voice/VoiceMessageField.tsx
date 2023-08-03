import React, {useState, useEffect, useCallback} from 'react'

import {
    VoiceMessage,
    VoiceMessageRecording,
    VoiceMessageTextToSpeech,
    VoiceMessageType,
} from 'models/integration/types'
import {TEXT_TO_SPEECH_MAX_LENGTH} from 'models/integration/constants'
import RadioButton from 'pages/common/components/RadioButton'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Textarea from 'pages/common/forms/TextArea'
import {countLines} from 'utils/string'
import useVoiceMessageValidation from './hooks/useVoiceMessageValidation'

import css from './VoiceMessageField.less'

type Props = {
    value: VoiceMessage
    onChange: (value: VoiceMessage) => void
    allowNone?: boolean
    maxRecordingDuration?: number
    horizontal?: boolean
}

const VoiceMessageField = ({
    value,
    onChange,
    allowNone,
    maxRecordingDuration,
    horizontal = false,
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

    const handleVoiceRecordingRemoval = useCallback(() => {
        setVoiceRecordingPath(undefined)
        const newValue: VoiceMessageRecording = {
            ...value,
            voice_message_type: VoiceMessageType.VoiceRecording,
            new_voice_recording_file: undefined,
            new_voice_recording_file_name: undefined,
            new_voice_recording_file_type: undefined,
            voice_recording_file_path: undefined,
        }
        onChange(newValue)
    }, [onChange, value])

    if (horizontal) {
        return (
            <>
                <div className={css.horizontalRadioButtons}>
                    <VoiceRecordingRadioButton
                        selectedVoiceMessageType={value.voice_message_type}
                        onChange={handleVoiceMessageTypeChange}
                        label={'Voice recording'}
                        caption={'Max 2MB, mp3 only'}
                    />
                    <TextToSpeechRadioButton
                        selectedVoiceMessageType={value.voice_message_type}
                        onChange={handleVoiceMessageTypeChange}
                        label={'Text-to-speech'}
                    />
                    {allowNone && (
                        <NoneRadioButton
                            selectedVoiceMessageType={value.voice_message_type}
                            onChange={handleVoiceMessageTypeChange}
                        />
                    )}
                </div>
                {value.voice_message_type ===
                    VoiceMessageType.VoiceRecording && (
                    <VoiceRecordingInput
                        voiceRecordingPath={voiceRecordingPath}
                        handleVoiceRecordingUpload={handleVoiceRecordingUpload}
                        handleVoiceRecordingRemoval={
                            handleVoiceRecordingRemoval
                        }
                        className={css.optionContentHorizontal}
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
            />
            {value.voice_message_type === VoiceMessageType.VoiceRecording && (
                <VoiceRecordingInput
                    voiceRecordingPath={voiceRecordingPath}
                    handleVoiceRecordingUpload={handleVoiceRecordingUpload}
                />
            )}
            <TextToSpeechRadioButton
                selectedVoiceMessageType={value.voice_message_type}
                onChange={handleVoiceMessageTypeChange}
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
}

const NoneRadioButton = ({
    selectedVoiceMessageType,
    onChange,
    label = 'None',
}: VoiceMessageRadioButtonProps) => {
    return (
        <RadioButton
            className={css.radioButtonOption}
            label={label}
            value={VoiceMessageType.None}
            isSelected={selectedVoiceMessageType === VoiceMessageType.None}
            onChange={onChange}
        />
    )
}

const TextToSpeechRadioButton = ({
    selectedVoiceMessageType,
    onChange,
    label = 'Text To Speech',
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
        />
    )
}

const VoiceRecordingRadioButton = ({
    selectedVoiceMessageType,
    onChange,
    label = 'Insert Voice Recording',
    caption = '',
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
    const noMessageProvided = selectedValue.text_to_speech_content?.length === 0
    return (
        <div className={className}>
            <Textarea
                className={css.textToSpeechTextarea}
                maxLength={TEXT_TO_SPEECH_MAX_LENGTH}
                value={selectedValue.text_to_speech_content ?? ''}
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
            />
        </div>
    )
}

type PropsVoiceRecordingInput = {
    voiceRecordingPath: Maybe<string>
    handleVoiceRecordingUpload: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => Promise<void>
    handleVoiceRecordingRemoval?: () => void
    uploadLabel?: string
    className?: string
}

const VoiceRecordingInput = ({
    voiceRecordingPath,
    handleVoiceRecordingUpload,
    handleVoiceRecordingRemoval,
    uploadLabel = 'Select file',
    className = css.optionContent,
}: PropsVoiceRecordingInput) => {
    const voiceRecordingFileInput = React.useRef<HTMLInputElement>(null)

    const handleUploadButtonClick = () => {
        voiceRecordingFileInput?.current?.click()
    }
    const allowRemoving = !!handleVoiceRecordingRemoval
    return (
        <div className={className}>
            {voiceRecordingPath && (
                <div
                    className={
                        handleVoiceRecordingRemoval && css.recordingWithRemove
                    }
                >
                    {
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <audio controls src={voiceRecordingPath} />
                    }
                    {allowRemoving && (
                        <div>
                            <Button
                                id={`recording-delete`}
                                intent="destructive"
                                onClick={handleVoiceRecordingRemoval}
                                fillStyle={'ghost'}
                            >
                                <ButtonIconLabel icon="delete" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
            {(!voiceRecordingPath || !allowRemoving) && (
                <div>
                    <input
                        className="d-none"
                        type="file"
                        accept=".mp3"
                        ref={voiceRecordingFileInput}
                        onChange={handleVoiceRecordingUpload}
                    />
                    <Button
                        intent="secondary"
                        onClick={handleUploadButtonClick}
                    >
                        <ButtonIconLabel icon="backup">
                            {uploadLabel}
                        </ButtonIconLabel>
                    </Button>
                </div>
            )}
        </div>
    )
}

export default VoiceMessageField
