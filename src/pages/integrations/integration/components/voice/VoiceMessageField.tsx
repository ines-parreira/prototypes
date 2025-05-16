import React, { useCallback, useEffect, useState } from 'react'

import _get from 'lodash/get'

import { useUploadCustomVoiceRecording } from '@gorgias/api-queries'
import {
    VoiceMessage as ApiVoiceMessage,
    VoiceMessageType as ApiVoiceMessageType,
    CustomRecordingType,
} from '@gorgias/api-types'

import useAppDispatch from 'hooks/useAppDispatch'
import { GorgiasApiResponseDataError } from 'models/api/types'
import {
    MAX_VOICE_RECORDING_FILE_SIZE_MB,
    TEXT_TO_SPEECH_MAX_LENGTH,
} from 'models/integration/constants'
import {
    VoiceMessage,
    VoiceMessageTextToSpeech,
    VoiceMessageType,
} from 'models/integration/types'
import RadioButton from 'pages/common/components/RadioButton'
import Textarea from 'pages/common/forms/TextArea'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { countLines } from 'utils/string'

import useVoiceMessageValidation from './hooks/useVoiceMessageValidation'
import VoiceRecordingInput from './VoiceRecordingInput'

import css from './VoiceMessageField.less'

type Props = {
    value: VoiceMessage
    onChange: (value: VoiceMessage) => void
    allowNone?: boolean
    maxRecordingDuration?: number
    horizontal?: boolean
    radioButtonId?: string
    isDisabled?: boolean
    shouldUpload?: boolean
    customRecordingType?: CustomRecordingType
}

const VoiceMessageField = ({
    value,
    onChange,
    allowNone,
    maxRecordingDuration,
    horizontal = false,
    radioButtonId = '',
    isDisabled = false,
    shouldUpload = false,
    customRecordingType,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()
    const { validateVoiceRecordingUpload } = useVoiceMessageValidation()
    const [voiceRecordingPath, setVoiceRecordingPath] = useState<
        string | undefined | null
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
        // TODO(React18): Remove any type
        (type: any) => {
            onChange({
                ...value,
                voice_message_type: type,
            })
        },
        [value, onChange],
    )

    const { mutate: uploadFile, isLoading } = useUploadCustomVoiceRecording({
        mutation: {
            onSuccess: (response) => {
                const newValue: ApiVoiceMessage = {
                    voice_recording_file_path: response.data.url,
                    voice_message_type: ApiVoiceMessageType.VoiceRecording,
                }
                setVoiceRecordingPath(newValue.voice_recording_file_path)
                onChange(newValue)
            },
            onError: (err) => {
                const error = _get(err, 'response.data.error', '') as
                    | GorgiasApiResponseDataError
                    | undefined
                void dispatch(
                    notify({
                        title:
                            error?.msg || 'Failed to upload custom recording',
                        status: NotificationStatus.Error,
                    }),
                )
            },
        },
    })

    const handleVoiceRecordingUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const voiceRecordingUpload = await validateVoiceRecordingUpload(
            event,
            maxRecordingDuration,
            MAX_VOICE_RECORDING_FILE_SIZE_MB,
            horizontal,
        )
        if (voiceRecordingUpload) {
            if (shouldUpload && customRecordingType) {
                const { uploadedFile } = voiceRecordingUpload
                const params = {
                    type: customRecordingType,
                    ...(value.voice_recording_file_path
                        ? { replaces: value.voice_recording_file_path }
                        : {}),
                }
                uploadFile({ data: { file: uploadedFile }, params })
            } else {
                const { url, newVoiceFields } = voiceRecordingUpload
                setVoiceRecordingPath(url)

                const newValue: VoiceMessage = {
                    ...value,
                    ...newVoiceFields,
                    voice_message_type: VoiceMessageType.VoiceRecording,
                }
                onChange(newValue)
            }
        }
    }

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
                        isLoading={isLoading}
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
    selectedVoiceMessageType: VoiceMessageType | ApiVoiceMessageType
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
