export const ERROR_MESSAGE = 'ERROR_MESSAGE'
export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'

// Resets the currently visible error message.
export function resetErrorMessage() {
    return {
        type: RESET_ERROR_MESSAGE
    }
}

export function errorMsg(errormsg) {
    return {
        type: ERROR_MESSAGE,
        errormsg
    }
}