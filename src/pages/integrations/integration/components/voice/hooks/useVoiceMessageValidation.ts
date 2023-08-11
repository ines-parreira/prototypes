import React from 'react'
import _pick from 'lodash/pick'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getBase64} from 'utils/file'
import {
    PhoneIntegrationVoicemailOutsideBusinessHoursSettings,
    PhoneIntegrationVoicemailSettings,
    VoiceMessage,
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

    const validateVoiceMessage = (payload: Maybe<VoiceMessage>) => {
        if (!payload) {
            return true
        }

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

    /**
     * Check if the voicemail settings can be submitted:
     *   we have valid settings for the during business hours settings
     *   we have outside business hours settings and they are valid
     * @param payload
     */
    const canPayloadBeSubmitted = (
        payload: Maybe<PhoneIntegrationVoicemailSettings>
    ) => {
        if (!payload) {
            return true
        }
        const outsideBusinessHours: Maybe<PhoneIntegrationVoicemailOutsideBusinessHoursSettings> =
            payload.outside_business_hours
        if (
            outsideBusinessHours &&
            'voice_message_type' in outsideBusinessHours
        ) {
            return (
                validateVoiceMessage(payload) &&
                validateVoiceMessage(outsideBusinessHours)
            )
        }
        return validateVoiceMessage(payload)
    }

    /**
     * Clean voicemail settings by retrieving only the chosen voice message fields
     * @param payload
     */
    const _cleanUpVoicemailSettings = (
        payload:
            | Maybe<PhoneIntegrationVoicemailSettings>
            | Maybe<PhoneIntegrationVoicemailOutsideBusinessHoursSettings>
    ): Maybe<VoiceMessage> => {
        if (!payload || !('voice_message_type' in payload)) {
            return null
        }
        switch (payload.voice_message_type) {
            case VoiceMessageType.None:
                return _pick(payload, ['voice_message_type'])
            case VoiceMessageType.TextToSpeech:
                return _pick(payload, [
                    'voice_message_type',
                    'text_to_speech_content',
                ])
            case VoiceMessageType.VoiceRecording:
                return _pick(payload, [
                    'voice_message_type',
                    'voice_recording_file_path',
                    'new_voice_recording_file',
                    'new_voice_recording_file_name',
                    'new_voice_recording_file_type',
                ])
        }
    }

    /**
     * Clean up the outside business hours payload.
     * If the user chose to use the same settings as during business hours,
     * discard all other changed fields from the payload.
     * @param payload
     */
    const _cleanUpOutsideBusinessHoursPayload = (
        payload: Maybe<PhoneIntegrationVoicemailOutsideBusinessHoursSettings>
    ): Maybe<PhoneIntegrationVoicemailOutsideBusinessHoursSettings> => {
        if (!payload) {
            return null
        }
        const useSameSettings =
            payload?.use_during_business_hours_settings ?? true
        const defaultSettings = {
            use_during_business_hours_settings: useSameSettings,
        }
        if (useSameSettings) {
            return defaultSettings
        }

        const cleanSettings = _cleanUpVoicemailSettings(payload)
        if (cleanSettings) {
            return {
                ...defaultSettings,
                ...cleanSettings,
            }
        }
        return defaultSettings
    }

    const cleanUpPayload = (
        payload: Maybe<PhoneIntegrationVoicemailSettings>
    ): Maybe<PhoneIntegrationVoicemailSettings> => {
        if (!payload) {
            return null
        }

        const cleanMessage = _cleanUpVoicemailSettings(payload)
        if (!cleanMessage) {
            return null
        }
        const cleanPayload: PhoneIntegrationVoicemailSettings = {
            ...cleanMessage,
            allow_to_leave_voicemail: payload?.allow_to_leave_voicemail ?? true,
        }

        const outsideBusinessHoursPayload = _cleanUpOutsideBusinessHoursPayload(
            payload?.outside_business_hours
        )
        if (outsideBusinessHoursPayload) {
            cleanPayload.outside_business_hours = outsideBusinessHoursPayload
        }
        return cleanPayload
    }

    return {validateVoiceRecordingUpload, canPayloadBeSubmitted, cleanUpPayload}
}
