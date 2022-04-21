import React, {useState, useEffect, useCallback} from 'react'
import {Button, Input} from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    VoiceMessage,
    VoiceMessageRecording,
    VoiceMessageType,
} from 'models/integration/types'
import RadioButton from 'pages/common/components/RadioButton'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getBase64} from 'utils/file'
import {countLines} from 'utils/string'

import css from './VoiceMessageField.less'

type Props = {
    value: VoiceMessage
    onChange: (value: VoiceMessage) => void
    allowNone?: boolean
    maxRecordingDuration?: number
}

const TEXT_TO_SPEECH_MAX_LENGTH = 1000
const MAX_VOICE_RECORDING_FILE_SIZE_MB = 2
const MAX_VOICE_RECORDING_FILE_SIZE = MAX_VOICE_RECORDING_FILE_SIZE_MB * 1000000

const VoiceMessageField = ({
    value,
    onChange,
    allowNone,
    maxRecordingDuration,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()
    const voiceRecordingFileInput = React.useRef<HTMLInputElement>(null)
    const handleVoiceMessageTypeChange = useCallback(
        (type) => {
            onChange({
                ...value,
                voice_message_type: type,
            })
        },
        [value, onChange]
    )

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

    const handleUploadButtonClick = () => {
        voiceRecordingFileInput?.current?.click()
    }

    const handleVoiceRecordingUpload = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            if (!event.target.files) {
                return
            }

            const uploadedFile = event.target.files[0]
            if (uploadedFile.size > MAX_VOICE_RECORDING_FILE_SIZE) {
                void dispatch(
                    notify({
                        message: `Invalid file size. The max size is ${MAX_VOICE_RECORDING_FILE_SIZE_MB} MB.`,
                        status: NotificationStatus.Error,
                    })
                )
                return
            }

            const url = window.URL.createObjectURL(uploadedFile)

            if (maxRecordingDuration) {
                try {
                    const duration = await getAudioFileDuration(url)
                    if (duration > maxRecordingDuration) {
                        void dispatch(
                            notify({
                                message: `Please upload an audio file of ${maxRecordingDuration} seconds or less.`,
                                status: NotificationStatus.Error,
                            })
                        )
                        return
                    }
                } catch {
                    void dispatch(
                        notify({
                            message:
                                'Invalid audio file provided. Please upload a valid mp3 file.',
                            status: NotificationStatus.Error,
                        })
                    )
                    return
                }
            }

            setVoiceRecordingPath(url)

            const serializedFile = await getBase64(uploadedFile)
            const newValue: VoiceMessageRecording = {
                ...value,
                voice_message_type: VoiceMessageType.VoiceRecording,
                new_voice_recording_file: serializedFile,
                new_voice_recording_file_name: uploadedFile.name,
                new_voice_recording_file_type: uploadedFile.type,
            }
            onChange(newValue)
        },
        [value, onChange, maxRecordingDuration, dispatch]
    )

    const textToSpeechLines =
        value.voice_message_type === VoiceMessageType.TextToSpeech &&
        value.text_to_speech_content
            ? countLines(value.text_to_speech_content)
            : 0

    return (
        <>
            <RadioButton
                className="mb-3"
                label="Insert Voice Recording"
                value={VoiceMessageType.VoiceRecording}
                isSelected={
                    value.voice_message_type === VoiceMessageType.VoiceRecording
                }
                onChange={handleVoiceMessageTypeChange}
            />
            {value.voice_message_type === VoiceMessageType.VoiceRecording && (
                <div className={css.optionContent}>
                    <div>
                        {voiceRecordingPath && (
                            // eslint-disable-next-line jsx-a11y/media-has-caption
                            <audio controls src={voiceRecordingPath} />
                        )}
                    </div>
                    <div>
                        <input
                            className="d-none"
                            type="file"
                            accept=".mp3"
                            ref={voiceRecordingFileInput}
                            onChange={handleVoiceRecordingUpload}
                        />
                        <Button type="button" onClick={handleUploadButtonClick}>
                            <i className="material-icons large">backup</i>{' '}
                            Select file
                        </Button>
                    </div>
                </div>
            )}
            <RadioButton
                className="mb-3"
                label="Text To Speech"
                value={VoiceMessageType.TextToSpeech}
                isSelected={
                    value.voice_message_type === VoiceMessageType.TextToSpeech
                }
                onChange={handleVoiceMessageTypeChange}
            />
            {value.voice_message_type === VoiceMessageType.TextToSpeech && (
                <div className={css.optionContent}>
                    <Input
                        type="textarea"
                        maxLength={TEXT_TO_SPEECH_MAX_LENGTH}
                        value={value.text_to_speech_content ?? ''}
                        onChange={(event) => {
                            onChange({
                                ...value,
                                text_to_speech_content: event.target.value,
                            })
                        }}
                        rows={textToSpeechLines > 2 ? textToSpeechLines : 2}
                    />
                </div>
            )}
            {allowNone && (
                <RadioButton
                    className="mb-3"
                    label="None"
                    value={VoiceMessageType.None}
                    isSelected={
                        value.voice_message_type === VoiceMessageType.None
                    }
                    onChange={handleVoiceMessageTypeChange}
                />
            )}
        </>
    )
}

function getAudioFileDuration(url: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const audio = new Audio(url)
        audio.addEventListener('error', () => reject(), false)
        audio.addEventListener(
            'canplaythrough',
            () => resolve(audio.duration),
            false
        )
    })
}

export default VoiceMessageField
