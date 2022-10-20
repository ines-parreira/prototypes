export const INCOMING_PHONE_CALL = 'incoming-phone-call'
export const OUTGOING_PHONE_CALL = 'outgoing-phone-call'
export const COMPLETED_PHONE_CALL = 'completed-phone-call'
export const CALL_RECORDING = 'call-recording'
export const MISSED_PHONE_CALL = 'missed-phone-call'
export const VOICEMAIL_RECORDING = 'voicemail-recording'
export const PHONE_CALL_ANSWERED = 'phone-call-answered'
export const PHONE_CALL_CONVERSATION_STARTED = 'phone-call-conversation-started'
export const PHONE_CALL_FORWARDED_TO_EXTERNAL_NUMBER =
    'phone-call-forwarded-to-external-number'
export const PHONE_CALL_FORWARDED_TO_GORGIAS_NUMBER =
    'phone-call-forwarded-to-gorgias-number'
export const PHONE_CALL_FORWARDED = 'phone-call-forwarded'
export const PLAYED_MESSAGE = 'message-played'
export const PHONE_CALL_TRANSFERRED_TO_AGENT = 'phone-call-transferred-to-agent'
export const PHONE_CALL_TRANSFER_TO_AGENT_FAILED =
    'phone-call-transfer-to-agent-failed'
export const PHONE_CALL_TRANSFER_TO_AGENT_MISSED =
    'phone-call-transfer-to-agent-missed'

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
    PHONE_CALL_FORWARDED_TO_EXTERNAL_NUMBER,
    PHONE_CALL_FORWARDED_TO_GORGIAS_NUMBER,
    PHONE_CALL_FORWARDED,
    PLAYED_MESSAGE,
    PHONE_CALL_TRANSFERRED_TO_AGENT,
    PHONE_CALL_TRANSFER_TO_AGENT_FAILED,
    PHONE_CALL_TRANSFER_TO_AGENT_MISSED,
})

export const PHONE_EVENTS = Object.freeze(Object.values(PHONE_EVENTS_MAP))
