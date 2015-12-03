export const SYSTEM_MESSAGE = 'SYSTEM_MESSAGE'
export const DISMISS_SYSTEM_MESSAGE = 'DISMISS_SYSTEM_MESSAGE'


// Resets the currently visible system message.
export function dismissMessage() {
    return {
        type: DISMISS_SYSTEM_MESSAGE
    }
}
// set a system message
export function systemMessage(message) {
    return {
        type: SYSTEM_MESSAGE,
        message
    }
}
