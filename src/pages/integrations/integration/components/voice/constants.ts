export const PHONE_INTEGRATION_BASE_URL = '/app/settings/channels/phone'

export const RING_TIME_DEFAULT_VALUE = 60
export const RING_TIME_MIN_VALUE = 10
export const RING_TIME_MAX_VALUE = 600
export const RING_TIME_VALIDATION_ERROR =
    'Ring time must be between 10 and 600 seconds (10 minutes).'

export const WAIT_TIME_DEFAULT_VALUE = 120
export const WAIT_TIME_MIN_VALUE = 10
export const WAIT_TIME_MAX_VALUE = 3600
export const WAIT_TIME_DEFAULT_ENABLED = true
export const WAIT_TIME_VALIDATION_ERROR =
    'Wait time must be between 10 and 3600 seconds (1 hour).'

export const DEFAULT_WAIT_TIME_PREFERENCES = {
    enabled: WAIT_TIME_DEFAULT_ENABLED,
    value: WAIT_TIME_DEFAULT_VALUE,
}

export const DEFAULT_TRANSCRIBE_PREFERENCES = {
    voicemails: false,
    recordings: false,
}
