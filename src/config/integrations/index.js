export const CHAT_AUTO_RESPONDER_REPLY_SHORTLY = 'reply-shortly'
export const CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES = 'reply-in-minutes'
export const CHAT_AUTO_RESPONDER_REPLY_IN_HOURS = 'reply-in-hours'
export const CHAT_AUTO_RESPONDER_REPLY_IN_DAY = 'reply-in-day'
export const CHAT_AUTO_RESPONDER_REPLY_DEFAULT = CHAT_AUTO_RESPONDER_REPLY_SHORTLY
export const CHAT_AUTO_RESPONDER_ENABLED_DEFAULT = false
export const CHAT_AUTO_RESPONDER_REPLY_OPTIONS = [
    CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
    CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    CHAT_AUTO_RESPONDER_REPLY_IN_DAY
]

export const CHAT_AUTO_RESPONDER_TEXTS = require('../../../../../integrations/texts/chat_auto_responder_texts.json')


export const getAutoResponderReplyOptions = (language: ?string): Array<Object> => {
    if (!language) {
        return []
    }

    return CHAT_AUTO_RESPONDER_REPLY_OPTIONS.map((option) => {
        return {
            value: option,
            label: `"${CHAT_AUTO_RESPONDER_TEXTS[language][option]}"`
        }
    })
}
