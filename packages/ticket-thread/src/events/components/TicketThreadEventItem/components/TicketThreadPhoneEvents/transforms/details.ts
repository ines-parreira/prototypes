import parsePhoneNumberFromString from 'libphonenumber-js'

import type {
    PhoneEventData,
    PhoneEventDetailsEntry,
    PhoneEventType,
} from './types'

function getStringValue(value: unknown): string | null {
    if (typeof value === 'string' && value.trim()) {
        return value
    }

    if (typeof value === 'number') {
        return value.toString()
    }

    return null
}

function formatPhoneNumber(value: unknown): string | null {
    const normalizedValue = getStringValue(value)

    if (!normalizedValue) {
        return null
    }

    try {
        return (
            parsePhoneNumberFromString(
                normalizedValue,
            )?.formatInternational() ?? normalizedValue
        )
    } catch {
        return normalizedValue
    }
}

export function getPhoneEventTicketId(event: PhoneEventData): string | null {
    return getStringValue(event.data?.phone_ticket_id)
}

export function getPhoneEventCustomerName(
    event: PhoneEventData,
): string | null {
    return getStringValue(event.data?.customer?.name)
}

export function hasPhoneEventDetails(type: PhoneEventType): boolean {
    return (
        type === 'phone-call-forwarded-to-external-number' ||
        type === 'phone-call-forwarded-to-gorgias-number' ||
        type === 'message-played'
    )
}

function getForwardedCallDetails(
    event: PhoneEventData,
): PhoneEventDetailsEntry[] {
    const forwardedNumber = formatPhoneNumber(
        event.data?.call?.selected_menu_option?.forward_call?.phone_number,
    )

    if (!forwardedNumber) {
        return []
    }

    return [{ key: 'Forwarded to', value: forwardedNumber }]
}

function getMessagePlayedDetails(
    event: PhoneEventData,
): PhoneEventDetailsEntry[] {
    const voiceMessageType =
        event.data?.call?.selected_menu_option?.voice_message
            ?.voice_message_type
    const isVoiceRecording = voiceMessageType === 'voice_recording'
    const content = getStringValue(
        isVoiceRecording
            ? event.data?.call?.selected_menu_option?.voice_message
                  ?.new_voice_recording_file_name
            : event.data?.call?.selected_menu_option?.voice_message
                  ?.text_to_speech_content,
    )

    if (!content) {
        return []
    }

    return [
        {
            key: isVoiceRecording ? 'Audio recording' : 'Text',
            value: content,
        },
    ]
}

export function getPhoneEventDetailsEntries(
    event: PhoneEventData,
): PhoneEventDetailsEntry[] {
    switch (event.type) {
        case 'phone-call-forwarded-to-external-number':
        case 'phone-call-forwarded-to-gorgias-number':
            return getForwardedCallDetails(event)
        case 'message-played':
            return getMessagePlayedDetails(event)
        default:
            return []
    }
}
