export const PHONE_CALL_CONVERSATION_STARTED = 'phone-call-conversation-started'
export const PHONE_CALL_FORWARDED_TO_EXTERNAL_NUMBER =
    'phone-call-forwarded-to-external-number'
export const PHONE_CALL_FORWARDED_TO_GORGIAS_NUMBER =
    'phone-call-forwarded-to-gorgias-number'
export const PHONE_CALL_FORWARDED = 'phone-call-forwarded'
export const PLAYED_MESSAGE = 'message-played'
export const DECLINED_PHONE_CALL = 'declined-phone-call'
export const OUTGOING_PHONE_CALL_CONNECTED = 'outgoing-phone-call-connected'
export const CHILD_CALL_NOT_ANSWERED = 'child-call-not-answered'
export const PHONE_CALL_RINGING = 'phone-call-ringing'

//$TsFixMe fallback value for js, use PhoneIntegrationEvent enum instead
export const PHONE_EVENTS_MAP = Object.freeze({
    PHONE_CALL_CONVERSATION_STARTED,
    PHONE_CALL_FORWARDED_TO_EXTERNAL_NUMBER,
    PHONE_CALL_FORWARDED_TO_GORGIAS_NUMBER,
    PHONE_CALL_FORWARDED,
    PLAYED_MESSAGE,
})

export const PHONE_EVENTS = Object.freeze(Object.values(PHONE_EVENTS_MAP))
