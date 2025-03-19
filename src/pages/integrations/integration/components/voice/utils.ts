import {
    UpdatePhoneIntegrationSettingsRecordingNotification,
    UpdateVoiceQueue,
    VoiceMessageType,
    VoiceQueue,
} from '@gorgias/api-queries'

import { VoiceMessage } from 'models/integration/types'

export function getAudioFileDuration(url: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const audio = new Audio(url)
        audio.addEventListener('error', () => reject(), false)
        audio.addEventListener(
            'canplaythrough',
            () => resolve(audio.duration),
            false,
        )
    })
}

export const isValueInRange = (
    value: number,
    minValue: number,
    maxValue: number,
) => {
    return value >= minValue && value <= maxValue
}

/**
 * Get the payload to update the recording notification settings
 * @param payload
 */
export const getVoiceMessagePayload = (
    voice_message: VoiceMessage,
): Maybe<UpdatePhoneIntegrationSettingsRecordingNotification> => {
    switch (voice_message.voice_message_type) {
        case VoiceMessageType.None:
            return { voice_message_type: VoiceMessageType.None }
        case VoiceMessageType.TextToSpeech:
            if (!voice_message.text_to_speech_content) {
                return null
            }
            return {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: voice_message.text_to_speech_content,
            }
        case VoiceMessageType.VoiceRecording:
            if (
                !voice_message.new_voice_recording_file ||
                !voice_message.new_voice_recording_file_name ||
                !voice_message.new_voice_recording_file_type
            ) {
                return { voice_message_type: VoiceMessageType.VoiceRecording }
            }
            return {
                voice_message_type: voice_message.voice_message_type,
                new_voice_recording_file:
                    voice_message.new_voice_recording_file,
                new_voice_recording_file_name:
                    voice_message.new_voice_recording_file_name,
                new_voice_recording_file_type:
                    voice_message.new_voice_recording_file_type,
            }
    }
}

export const getVoiceQueueEditableFields = (
    queue: VoiceQueue,
): UpdateVoiceQueue => {
    return {
        name: queue.name,
        capacity: queue.capacity,
        priority_weight: queue.priority_weight,
        distribution_mode: queue.distribution_mode,
        linked_targets: queue.linked_targets,
        ring_time: queue.ring_time,
        target_scope: queue.target_scope,
        wait_time: queue.wait_time,
        wait_music: queue.wait_music,
    }
}
