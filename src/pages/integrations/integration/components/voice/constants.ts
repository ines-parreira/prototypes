import {
    CreateVoiceQueue,
    PhoneRingingBehaviour,
    UpdateVoiceQueue,
    VoiceQueueTargetScope,
} from '@gorgias/helpdesk-queries'

import { QUEUE_DEFAULT_WAIT_MUSIC_PREFERENCES } from './waitMusicLibraryConstants'

export const PHONE_INTEGRATION_BASE_URL = '/app/settings/channels/phone'

export const RING_TIME_DEFAULT_VALUE = 60
export const RING_TIME_MIN_VALUE = 10
export const RING_TIME_MAX_VALUE = 600
export const RING_TIME_VALIDATION_ERROR =
    'Ring time must be between 10 and 600 seconds (10 minutes).'

const WAIT_TIME_DEFAULT_VALUE = 120
export const WAIT_TIME_MIN_VALUE = 10
export const WAIT_TIME_MAX_VALUE = 3600
const WAIT_TIME_DEFAULT_ENABLED = true
export const WAIT_TIME_VALIDATION_ERROR =
    'Wait time must be between 10 and 3600 seconds (1 hour).'
export const QUEUE_CAPACITY_MIN_VALUE = 1
export const QUEUE_CAPACITY_MAX_VALUE = 100
export const QUEUE_CAPACITY_VALIDATION_ERROR =
    'Capacity must be between 1 and 100.'

export const WRAP_UP_TIME_MIN_VALUE = 10
export const WRAP_UP_TIME_MAX_VALUE = 600
export const WRAP_UP_TIME_VALIDATION_ERROR =
    'Wrap-up time must be between 10 and 600 seconds (10 minutes).'

export const DEFAULT_WAIT_TIME_PREFERENCES = {
    enabled: WAIT_TIME_DEFAULT_ENABLED,
    value: WAIT_TIME_DEFAULT_VALUE,
}

export const DEFAULT_TRANSCRIBE_PREFERENCES = {
    voicemails: false,
    recordings: false,
}

export const QUEUE_LIST_PAGE_SIZE = 10

export const DEFAULT_QUEUE_VALUES: UpdateVoiceQueue | CreateVoiceQueue = {
    name: '',
    capacity: 100,
    priority_weight: 100,
    distribution_mode: PhoneRingingBehaviour.RoundRobin,
    linked_targets: [],
    ring_time: 30,
    target_scope: VoiceQueueTargetScope.AllAgents,
    wait_time: 120,
    wait_music: QUEUE_DEFAULT_WAIT_MUSIC_PREFERENCES,
    is_wrap_up_time_enabled: false,
    wrap_up_time: 30,
}
