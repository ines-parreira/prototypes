import _ from 'lodash'
import {systemMessage} from '../../state/systemMessage/actions'

/**
 * Middleware displaying errors from server when the error property exists
 * @param store
 */
const serverErrorHandler = store => next => action => {
    if (action && action.error) {
        const error = _.get(action, 'error.response.data.error', '')

        const message =
            error.msg
            || action.reason
            || `Unknown error for action ${action.type}`

        console.error('ERROR', message, action.error)

        store.dispatch(systemMessage({
            type: 'error',
            header: `Error: ${message}.`,
            internalMessage: message
        }))
    }

    return next(action)
}

export default serverErrorHandler
