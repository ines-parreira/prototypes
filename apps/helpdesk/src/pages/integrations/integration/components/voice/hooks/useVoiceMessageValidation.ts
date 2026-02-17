import { getBase64 } from '@repo/utils'
import _pick from 'lodash/pick'

import {
    VoiceQueueWaitMusicCustomRecordingTypeType,
    VoiceQueueWaitMusicLibraryTypeType,
} from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import type {
    IvrMenuAction,
    LocalWaitMusicPreferences,
    PhoneIntegrationIvrSettings,
    PhoneIntegrationVoicemailOutsideBusinessHoursSettings,
    PhoneIntegrationVoicemailSettings,
    VoiceMessage,
} from 'models/integration/types'
import { IvrMenuActionType, VoiceMessageType } from 'models/integration/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { getAudioFileDuration } from '../utils'

export default function useVoiceMessageValidation() {
    const dispatch = useAppDispatch()

    const validateVoiceRecordingUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
        maxRecordingDuration?: number,
        maxRecordingSizeInMB?: number,
        newErrorMessages = false,
    ) => {
        if (!event.target.files) {
            return null
        }

        const uploadedFile = event.target.files[0]
        if (
            maxRecordingSizeInMB &&
            uploadedFile.size > maxRecordingSizeInMB * 1_000_000
        ) {
            void dispatch(
                notify({
                    title: newErrorMessages ? 'Failed to upload' : '',
                    message: newErrorMessages
                        ? `File too large. Upload a recording smaller than ${maxRecordingSizeInMB}MB.`
                        : `Invalid file size. The max size is ${maxRecordingSizeInMB} MB.`,
                    status: NotificationStatus.Error,
                }),
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
                        }),
                    )
                    return null
                }
            } catch {
                void dispatch(
                    notify({
                        message:
                            'Invalid audio file format provided. Please upload a valid mp3 file.',
                        status: NotificationStatus.Error,
                    }),
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
        return { url, newVoiceFields, uploadedFile }
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
                }),
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
        payload: Maybe<PhoneIntegrationVoicemailSettings>,
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
    const _cleanUpVoiceMessageSettings = (
        payload:
            | Maybe<PhoneIntegrationVoicemailSettings>
            | Maybe<PhoneIntegrationVoicemailOutsideBusinessHoursSettings>
            | Maybe<VoiceMessage>,
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
        payload: Maybe<PhoneIntegrationVoicemailOutsideBusinessHoursSettings>,
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

        const cleanSettings = _cleanUpVoiceMessageSettings(payload)
        if (cleanSettings) {
            return {
                ...defaultSettings,
                ...cleanSettings,
            }
        }
        return defaultSettings
    }

    const _isValidTextToSpeech = (
        payload:
            | Maybe<PhoneIntegrationVoicemailSettings>
            | Maybe<PhoneIntegrationVoicemailOutsideBusinessHoursSettings>,
    ) => {
        if (!payload || !('voice_message_type' in payload)) {
            return true
        }
        return !(
            payload.voice_message_type === VoiceMessageType.TextToSpeech &&
            payload.text_to_speech_content?.length === 0
        )
    }

    const isValidTextToSpeech = (
        payload: Maybe<PhoneIntegrationVoicemailSettings>,
    ): boolean => {
        return (
            _isValidTextToSpeech(payload) &&
            _isValidTextToSpeech(payload?.outside_business_hours)
        )
    }

    const cleanUpPayload = (
        payload: Maybe<PhoneIntegrationVoicemailSettings>,
    ): Maybe<PhoneIntegrationVoicemailSettings> => {
        if (!payload) {
            return null
        }

        const cleanMessage = _cleanUpVoiceMessageSettings(payload)
        if (!cleanMessage) {
            return null
        }
        const cleanPayload: PhoneIntegrationVoicemailSettings = {
            ...cleanMessage,
            allow_to_leave_voicemail: payload?.allow_to_leave_voicemail ?? true,
        }

        const outsideBusinessHoursPayload = _cleanUpOutsideBusinessHoursPayload(
            payload?.outside_business_hours,
        )

        if (outsideBusinessHoursPayload) {
            cleanPayload.outside_business_hours = outsideBusinessHoursPayload
        }
        return cleanPayload
    }

    const cleanUpIvrPayload = (
        payload: Maybe<PhoneIntegrationIvrSettings>,
    ): Maybe<PhoneIntegrationIvrSettings> => {
        if (!payload) {
            return null
        }

        const cleanGreetingMessage =
            _cleanUpVoiceMessageSettings(payload.greeting_message) ??
            payload.greeting_message

        const cleanMenuOptions = payload.menu_options.map(
            (option: IvrMenuAction): IvrMenuAction => {
                if (option.action === IvrMenuActionType.PlayMessage) {
                    const cleanVoiceMessage =
                        _cleanUpVoiceMessageSettings(option.voice_message) ??
                        option.voice_message
                    return {
                        ...option,
                        action: IvrMenuActionType.PlayMessage,
                        voice_message: cleanVoiceMessage,
                    }
                }
                if (option.action === IvrMenuActionType.SendToSms) {
                    const cleanVoiceMessage =
                        _cleanUpVoiceMessageSettings(
                            option.sms_deflection.confirmation_message,
                        ) ?? option.sms_deflection.confirmation_message
                    return {
                        ...option,
                        sms_deflection: {
                            ...option.sms_deflection,
                            confirmation_message: cleanVoiceMessage,
                        },
                    }
                }
                return option
            },
        )
        return {
            greeting_message: cleanGreetingMessage,
            menu_options: cleanMenuOptions,
        }
    }

    const areVoiceMessagesTheSame = (
        voiceMessage: VoiceMessage,
        other: VoiceMessage,
    ) => {
        if (
            voiceMessage.voice_message_type === VoiceMessageType.TextToSpeech &&
            other.voice_message_type === VoiceMessageType.TextToSpeech
        ) {
            return (
                voiceMessage.text_to_speech_content ===
                other.text_to_speech_content
            )
        }

        if (
            voiceMessage.voice_message_type ===
                VoiceMessageType.VoiceRecording &&
            other.voice_message_type === VoiceMessageType.VoiceRecording
        ) {
            if (
                voiceMessage.new_voice_recording_file ||
                other.new_voice_recording_file
            ) {
                return false
            }
            return (
                voiceMessage.voice_recording_file_path ===
                other.voice_recording_file_path
            )
        }

        if (
            voiceMessage.voice_message_type === VoiceMessageType.None &&
            other.voice_message_type === VoiceMessageType.None
        ) {
            return true
        }

        return false
    }

    const areWaitMusicPreferencesTheSame = (
        preferences: LocalWaitMusicPreferences,
        other: LocalWaitMusicPreferences,
    ) => {
        if (
            preferences.type === VoiceQueueWaitMusicLibraryTypeType.Library &&
            other.type === VoiceQueueWaitMusicLibraryTypeType.Library
        ) {
            return preferences.library?.key === other.library?.key
        }

        if (
            preferences.type ===
                VoiceQueueWaitMusicCustomRecordingTypeType.CustomRecording &&
            other.type ===
                VoiceQueueWaitMusicCustomRecordingTypeType.CustomRecording
        ) {
            if (
                preferences.custom_recording?.audio_file ||
                other.custom_recording?.audio_file
            ) {
                return false
            }
            return (
                preferences.custom_recording?.audio_file_path ===
                other.custom_recording?.audio_file_path
            )
        }

        return false
    }

    return {
        validateVoiceRecordingUpload,
        canPayloadBeSubmitted,
        cleanUpPayload,
        isValidTextToSpeech,
        cleanUpIvrPayload,
        areVoiceMessagesTheSame,
        areWaitMusicPreferencesTheSame,
    }
}
