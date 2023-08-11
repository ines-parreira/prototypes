import React, {useState, useEffect, useCallback} from 'react'
import classnames from 'classnames'

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
                        label={'Text-to-speech'}
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
                        handleVoiceRecordingUpload={handleVoiceRecordingUpload}
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
                    handleVoiceRecordingUpload={handleVoiceRecordingUpload}
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
    uploadLabel?: string
    replaceLabel?: string
    className?: string
}

const VoiceRecordingInput = ({
    voiceRecordingPath,
    handleVoiceRecordingUpload,
    uploadLabel = 'Select file',
    replaceLabel = 'Select file',
    className = css.optionContent,
}: PropsVoiceRecordingInput) => {
    const voiceRecordingFileInput = React.useRef<HTMLInputElement>(null)

    const handleUploadButtonClick = () => {
        voiceRecordingFileInput?.current?.click()
    }
    return (
        <div className={className}>
            {voiceRecordingPath && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <audio
                    controls
                    src={voiceRecordingPath}
                    aria-label={'voice-recording'}
                />
            )}

            <div>
                <input
                    className={'d-none'}
                    type="file"
                    accept=".mp3"
                    ref={voiceRecordingFileInput}
                    onChange={handleVoiceRecordingUpload}
                />
                <Button
                    intent="secondary"
                    onClick={handleUploadButtonClick}
                    className={classnames({
                        [css.replaceFileButton]: !!voiceRecordingPath,
                    })}
                >
                    <ButtonIconLabel icon="backup">
                        {voiceRecordingPath ? replaceLabel : uploadLabel}
                    </ButtonIconLabel>
                </Button>
            </div>
        </div>
    )
}

export default VoiceMessageField
