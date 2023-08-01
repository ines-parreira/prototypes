import React from 'react'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getBase64} from 'utils/file'
import {
    PhoneIntegrationVoicemailSettings,
    VoiceMessageType,
} from 'models/integration/types'
import {
    MAX_VOICE_RECORDING_FILE_SIZE,
    MAX_VOICE_RECORDING_FILE_SIZE_MB,
} from 'models/integration/constants'
import {getAudioFileDuration} from '../utils'

export default function useVoiceMessageValidation() {
    const dispatch = useAppDispatch()

    const validateVoiceRecordingUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
        maxRecordingDuration?: number,
        newErrorMessages = false
    ) => {
        if (!event.target.files) {
            return null
        }

        const uploadedFile = event.target.files[0]
        if (uploadedFile.size > MAX_VOICE_RECORDING_FILE_SIZE) {
            void dispatch(
                notify({
                    title: newErrorMessages ? 'Failed to upload' : '',
                    message: newErrorMessages
                        ? `File too large. Upload a recording smaller than ${MAX_VOICE_RECORDING_FILE_SIZE_MB}MB.`
                        : `Invalid file size. The max size is ${MAX_VOICE_RECORDING_FILE_SIZE_MB} MB.`,
                    status: NotificationStatus.Error,
                })
            )
            return null
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
                    return null
                }
            } catch (ex) {
                void dispatch(
                    notify({
                        message:
                            'Invalid audio file format provided. Please upload a valid mp3 file.',
                        status: NotificationStatus.Error,
                    })
                )
                return null
            }
        }

        const serializedFile = await getBase64(uploadedFile)
        const newVoiceFields = {
            new_voice_recording_file: serializedFile,
            new_voice_recording_file_name: uploadedFile.name,
            new_voice_recording_file_type: uploadedFile.type,
        }
        return {url, newVoiceFields}
    }

    const canPayloadBeSubmitted = (
        payload: Partial<PhoneIntegrationVoicemailSettings>
    ) => {
        if (
            payload.voice_message_type === VoiceMessageType.VoiceRecording &&
            !payload.voice_recording_file_path &&
            !payload.new_voice_recording_file
        ) {
            void dispatch(
                notify({
                    message: `Cannot save. Upload a recording to use it as your voicemail.`,
                    status: NotificationStatus.Error,
                })
            )
            return false
        }

        return !(
            payload.voice_message_type === VoiceMessageType.TextToSpeech &&
            !payload.text_to_speech_content
        )
    }

    return {validateVoiceRecordingUpload, canPayloadBeSubmitted}
}
