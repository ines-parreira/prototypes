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
    const status = _get(action, 'error.response.status', '')

    // notify user and redirect him to the login page when his session has expired
    if (status === 419 || status === 401) {
        store.dispatch(notify({
            type: 'error',
            title: 'Your session has expired. You will be redirected on the login page in a few seconds.',
        }))

        setTimeout(() => {
            window.location.href = `${window.location.origin}/login`
        }, 3000)

        return next(action)
    }

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
