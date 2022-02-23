import {TICKET_EVENT_TYPES} from 'models/event/types'

export const INCOMING_PHONE_CALL = 'incoming-phone-call'
export const OUTGOING_PHONE_CALL = 'outgoing-phone-call'
export const COMPLETED_PHONE_CALL = 'completed-phone-call'
export const CALL_RECORDING = 'call-recording'
export const MISSED_PHONE_CALL = 'missed-phone-call'
export const VOICEMAIL_RECORDING = 'voicemail-recording'
export const PHONE_CALL_ANSWERED = 'phone-call-answered'
export const PHONE_CALL_CONVERSATION_STARTED = 'phone-call-conversation-started'

export const TICKET_EVENT_TYPES_VALUES = Object.freeze(
    Object.values(TICKET_EVENT_TYPES)
)

//$TsFixMe fallback value for js, use PhoneIntegrationEvent enum instead
export const PHONE_EVENTS_MAP = Object.freeze({
    INCOMING_PHONE_CALL,
    OUTGOING_PHONE_CALL,
    COMPLETED_PHONE_CALL,
    CALL_RECORDING,
    MISSED_PHONE_CALL,
    VOICEMAIL_RECORDING,
    PHONE_CALL_ANSWERED,
    PHONE_CALL_CONVERSATION_STARTED,
})

export const PHONE_EVENTS = Object.freeze(Object.values(PHONE_EVENTS_MAP))
