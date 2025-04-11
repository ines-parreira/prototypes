import {
    PhoneRingingBehaviour,
    UpdateVoiceQueue,
    VoiceQueueTargetScope,
} from '@gorgias/api-queries'

import { voiceQueue } from 'fixtures/voiceQueue'
import { VoiceMessageType } from 'models/integration/constants'

import {
    DEFAULT_QUEUE_VALUES,
    QUEUE_CAPACITY_VALIDATION_ERROR,
    RING_TIME_VALIDATION_ERROR,
    WAIT_TIME_VALIDATION_ERROR,
    WRAP_UP_TIME_VALIDATION_ERROR,
} from '../constants'
import {
    getVoiceMessagePayload,
    getVoiceQueueEditableFields,
    getVoiceQueueSummaryData,
    isValueInRange,
    mergeInitialValuesWithDefaultValues,
    queueSettingsCustomValidation,
} from '../utils'

describe('isValueInRange', () => {
    it('should check if a number is inside the range', () => {
        expect(isValueInRange(5, 0, 10)).toBe(true)
        expect(isValueInRange(-4, -10, 3)).toBe(true)
        expect(isValueInRange(5, 5, 15)).toBe(true)
        expect(isValueInRange(15, 5, 15)).toBe(true)
        expect(isValueInRange(0, 5, 15)).toBe(false)
        expect(isValueInRange(30, 5, 15)).toBe(false)
    })
})

describe('getVoiceMessagePayload', () => {
    it('should return the correct payload for type "None"', () => {
        const voice_message = {
            voice_message_type: VoiceMessageType.None,
        } as any
        expect(getVoiceMessagePayload(voice_message)).toEqual({
            voice_message_type: VoiceMessageType.None,
        })
    })

    describe('VoiceMessageType.TextToSpeech', () => {
        it('should return the correct payload for type "TextToSpeech" with content', () => {
            const voice_message = {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'test',
            } as any
            expect(getVoiceMessagePayload(voice_message)).toEqual({
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'test',
            })
        })

        it('should return null if the content is missing', () => {
            const voice_message = {
                voice_message_type: VoiceMessageType.TextToSpeech,
            } as any
            expect(getVoiceMessagePayload(voice_message)).toBeNull()
        })
    })

    describe('VoiceMessageType.VoiceRecording', () => {
        it('should return the correct payload when all fields are present', () => {
            const voice_message = {
                voice_message_type: VoiceMessageType.VoiceRecording,
                new_voice_recording_file: 'file',
                new_voice_recording_file_name: 'name',
                new_voice_recording_file_type: 'type',
            } as any
            expect(getVoiceMessagePayload(voice_message)).toEqual({
                voice_message_type: VoiceMessageType.VoiceRecording,
                new_voice_recording_file: 'file',
                new_voice_recording_file_name: 'name',
                new_voice_recording_file_type: 'type',
            })
        })

        it('should return the correct payload when some fields are missing', () => {
            const voice_message = {
                voice_message_type: VoiceMessageType.VoiceRecording,
                new_voice_recording_file: 'file',
            } as any
            expect(getVoiceMessagePayload(voice_message)).toEqual({
                voice_message_type: VoiceMessageType.VoiceRecording,
            })
        })
    })
})

describe('getVoiceQueueEditableFields', () => {
    const mockQueue = voiceQueue

    it('should return all editable fields from the queue', () => {
        const result = getVoiceQueueEditableFields(mockQueue)

        expect(result).toEqual({
            name: voiceQueue.name,
            capacity: voiceQueue.capacity,
            priority_weight: voiceQueue.priority_weight,
            distribution_mode: voiceQueue.distribution_mode,
            linked_targets: voiceQueue.linked_targets,
            ring_time: voiceQueue.ring_time,
            target_scope: voiceQueue.target_scope,
            wait_time: voiceQueue.wait_time,
            wait_music: voiceQueue.wait_music,
            is_wrap_up_time_enabled: false,
            wrap_up_time: 30,
        })
    })
})

describe('getVoiceQueueSummaryData', () => {
    it('should return the correct summary data', () => {
        const result = getVoiceQueueSummaryData(
            {
                ...voiceQueue,
                linked_targets: [
                    {
                        ...voiceQueue.linked_targets[0],
                        team_id: 1,
                    },
                ],
                agent_ids: [1, 2],
                ring_time: 30,
                wait_time: 60,
                capacity: 0,
                distribution_mode: PhoneRingingBehaviour.RoundRobin,
                target_scope: VoiceQueueTargetScope.Specific,
            },
            'Support Team',
        )

        expect(result).toEqual({
            'Ring to': 'Support Team',
            'Number of agents': 2,
            'Distribution mode': 'Round-robin',
            'Ring time per agent': '30 seconds',
            'Wait time': '60 seconds',
            'Queue capacity': 0,
        })
    })

    it('should return the correct summary data when the queue has no linked targets', () => {
        const result = getVoiceQueueSummaryData({
            ...voiceQueue,
            linked_targets: [],
            target_scope: VoiceQueueTargetScope.AllAgents,
            agent_ids: [1, 2],
            ring_time: 10,
            wait_time: 11,
            capacity: 0,
            distribution_mode: PhoneRingingBehaviour.RoundRobin,
        })

        expect(result).toEqual({
            'Ring to': 'All available agents',
            'Number of agents': 2,
            'Distribution mode': 'Round-robin',
            'Ring time per agent': '10 seconds',
            'Wait time': '11 seconds',
            'Queue capacity': 0,
        })
    })
})

describe('queueSettingsCustomValidation', () => {
    it('should return the correct validation errors when values are higher than the max values', () => {
        const result = queueSettingsCustomValidation({
            ...voiceQueue,
            ring_time: 1000,
            wait_time: 10000,
            capacity: 1000,
            is_wrap_up_time_enabled: true,
            wrap_up_time: 1000,
        })

        expect(result).toEqual({
            ring_time: RING_TIME_VALIDATION_ERROR,
            wait_time: WAIT_TIME_VALIDATION_ERROR,
            capacity: QUEUE_CAPACITY_VALIDATION_ERROR,
            wrap_up_time: WRAP_UP_TIME_VALIDATION_ERROR,
        })
    })

    it('should return the correct validation errors when values are lower than the min values', () => {
        const result = queueSettingsCustomValidation({
            ...voiceQueue,
            ring_time: 0,
            wait_time: 0,
            capacity: 0,
            is_wrap_up_time_enabled: true,
            wrap_up_time: 0,
        })

        expect(result).toEqual({
            ring_time: RING_TIME_VALIDATION_ERROR,
            wait_time: WAIT_TIME_VALIDATION_ERROR,
            capacity: QUEUE_CAPACITY_VALIDATION_ERROR,
            wrap_up_time: WRAP_UP_TIME_VALIDATION_ERROR,
        })
    })

    it('should return the correct validation errors when the wrap-up time is not enabled', () => {
        const result = queueSettingsCustomValidation({
            ...voiceQueue,
            is_wrap_up_time_enabled: false,
            wrap_up_time: 1000,
        })

        expect(result).toEqual({})
    })
})

describe('mergeInitialValuesWithDefaultValues', () => {
    it('should use default wrap_up_time when null is provided', () => {
        const queueWithNullWrapUpTime: UpdateVoiceQueue = {
            name: 'Test Queue',
            wrap_up_time: null,
        } as UpdateVoiceQueue

        const result = mergeInitialValuesWithDefaultValues(
            queueWithNullWrapUpTime,
        )

        expect(result.wrap_up_time).toBe(DEFAULT_QUEUE_VALUES.wrap_up_time)
        expect(result.name).toBe('Test Queue')
    })

    it('should keep existing wrap_up_time value when not null', () => {
        const customWrapUpTime = 45
        const queueWithCustomWrapUpTime: UpdateVoiceQueue = {
            name: 'Test Queue',
            wrap_up_time: customWrapUpTime,
        } as UpdateVoiceQueue

        const result = mergeInitialValuesWithDefaultValues(
            queueWithCustomWrapUpTime,
        )

        expect(result.wrap_up_time).toBe(customWrapUpTime)
        expect(result.name).toBe('Test Queue')
    })

    it('should preserve all other properties from the input queue', () => {
        const inputQueue: UpdateVoiceQueue = {
            name: 'Custom Queue',
            capacity: 50,
            ring_time: 45,
            wait_time: 180,
            wrap_up_time: null,
        } as UpdateVoiceQueue

        const result = mergeInitialValuesWithDefaultValues(inputQueue)

        expect(result).toEqual({
            ...inputQueue,
            wrap_up_time: DEFAULT_QUEUE_VALUES.wrap_up_time,
        })
    })
})
