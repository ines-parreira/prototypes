import _some from 'lodash/some'
import _get from 'lodash/get'
import {stripErrorMessage} from '../../utils'
import {notify} from '../../state/notifications/actions'

/**
 * Middleware displaying errors from server when the error property exists
 * @param store
 */

const IGNORED_PREFIXS = [
    'SUBMIT_ACTIVITY_ERROR',
    'redux-form',
    '@@redux-form',
]

const serverErrorHandler = store => next => action => {
    const shouldDisplayError = action
        && action.error
        && !_some(IGNORED_PREFIXS, (prefix) => action.type.startsWith(prefix))

    if (shouldDisplayError) {
        const error = _get(action, 'error.response.data.error', '')

        let message =
            error.msg
            || action.reason
            || `Unknown error for action ${action.type}`

        console.error('ERROR', message, action.error)

        message = stripErrorMessage(message)

        store.dispatch(notify({
            type: 'error',
            message,
        }))
    }

    return next(action)
}

export default serverErrorHandler
