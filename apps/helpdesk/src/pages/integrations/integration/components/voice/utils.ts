import {
    CreateVoiceQueue,
    PhoneIntegration,
    PhoneRingingBehaviour,
    UpdatePhoneIntegrationSettingsRecordingNotification,
    UpdateVoiceQueue,
    VoiceMessageType,
    VoiceQueue,
    VoiceQueueTargetScope,
} from '@gorgias/helpdesk-queries'

import { VoiceMessage } from 'models/integration/types'

import {
    DEFAULT_QUEUE_VALUES,
    QUEUE_CAPACITY_MAX_VALUE,
    QUEUE_CAPACITY_MIN_VALUE,
    QUEUE_CAPACITY_VALIDATION_ERROR,
    RING_TIME_MAX_VALUE,
    RING_TIME_MIN_VALUE,
    RING_TIME_VALIDATION_ERROR,
    WAIT_TIME_MAX_VALUE,
    WAIT_TIME_MIN_VALUE,
    WAIT_TIME_VALIDATION_ERROR,
    WRAP_UP_TIME_MAX_VALUE,
    WRAP_UP_TIME_MIN_VALUE,
    WRAP_UP_TIME_VALIDATION_ERROR,
} from './constants'

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
        is_wrap_up_time_enabled: queue.is_wrap_up_time_enabled,
        linked_targets: queue.linked_targets,
        ring_time: queue.ring_time,
        target_scope: queue.target_scope,
        wait_time: queue.wait_time,
        wait_music: queue.wait_music,
        wrap_up_time: queue.wrap_up_time,
        status: queue.status,
    }
}

export const queueSettingsCustomValidation = (
    values: UpdateVoiceQueue | CreateVoiceQueue,
) => {
    const errors: Partial<
        Record<keyof UpdateVoiceQueue | keyof CreateVoiceQueue, string>
    > = {}

    if (
        values.ring_time !== undefined &&
        (values.ring_time < RING_TIME_MIN_VALUE ||
            values.ring_time > RING_TIME_MAX_VALUE)
    ) {
        errors['ring_time'] = RING_TIME_VALIDATION_ERROR
    }
    if (
        values.wait_time !== undefined &&
        (values.wait_time < WAIT_TIME_MIN_VALUE ||
            values.wait_time > WAIT_TIME_MAX_VALUE)
    ) {
        errors['wait_time'] = WAIT_TIME_VALIDATION_ERROR
    }
    if (
        values.capacity !== undefined &&
        (values.capacity < QUEUE_CAPACITY_MIN_VALUE ||
            values.capacity > QUEUE_CAPACITY_MAX_VALUE)
    ) {
        errors['capacity'] = QUEUE_CAPACITY_VALIDATION_ERROR
    }
    if (values.is_wrap_up_time_enabled && values.wrap_up_time === null) {
        errors['wrap_up_time'] = WRAP_UP_TIME_VALIDATION_ERROR
    }

    const isWrapUpTimeValid =
        typeof values.wrap_up_time === 'number' &&
        values.wrap_up_time >= WRAP_UP_TIME_MIN_VALUE &&
        values.wrap_up_time <= WRAP_UP_TIME_MAX_VALUE

    if (values.is_wrap_up_time_enabled && !isWrapUpTimeValid) {
        errors['wrap_up_time'] = WRAP_UP_TIME_VALIDATION_ERROR
    }

    return errors
}

export const integrationSettingsIVRValidation = (
    values: Partial<PhoneIntegration>,
) => {
    const errors: Partial<Record<keyof PhoneIntegration, string>> = {}

    if (!values.name?.length) {
        errors['name'] = 'Name is required'
    }

    return errors
}

export const getVoiceQueueSummaryData = (
    queue: VoiceQueue,
    teamName: string = 'Specific team',
) => {
    return {
        'Ring to':
            queue.target_scope === VoiceQueueTargetScope.Specific
                ? teamName
                : 'All available agents',
        'Number of agents': queue.agent_ids ? queue.agent_ids.length : 0,
        'Distribution mode':
            queue.distribution_mode === PhoneRingingBehaviour.RoundRobin
                ? 'Round-robin'
                : 'Broadcast',
        'Ring time per agent': `${queue.ring_time} seconds`,
        'Wait time': `${queue.wait_time} seconds`,
        'Queue capacity': queue.capacity ?? 0,
    }
}

export const mergeInitialValuesWithDefaultValues = (
    queue: UpdateVoiceQueue,
): UpdateVoiceQueue => {
    return {
        ...queue,
        // cannot use merge here because wrap_up_time is nullable
        wrap_up_time:
            queue.wrap_up_time === null
                ? DEFAULT_QUEUE_VALUES.wrap_up_time
                : queue.wrap_up_time,
    }
}
