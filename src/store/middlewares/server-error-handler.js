import {systemMessage} from '../../state/systemMessage/actions'

/**
 * Middleware displaying errors from server when the error property exists
 * @param store
 */
const serverErrorHandler = store => next => action => {
    if (action.error) {
        const message = action.reason || action.error.message || `Unknown error for action ${action.type}`

        store.dispatch(systemMessage({
            type: 'error',
            header: `Error: ${message}.`,
            internalMessage: message
        }))
    }

    return next(action)
}

export default serverErrorHandler
