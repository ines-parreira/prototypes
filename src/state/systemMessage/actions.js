import * as types from './constants'

// Resets the currently visible system message.
export function dismissMessage() {
    return {
        type: types.DISMISS_SYSTEM_MESSAGE
    }
}

// set a system message
export function systemMessage(message) {
    return {
        type: types.SYSTEM_MESSAGE,
        message
    }
}
