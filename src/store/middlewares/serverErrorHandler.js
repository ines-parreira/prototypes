import _ from 'lodash'
import {notify} from '../../state/notifications/actions'

/**
 * Middleware displaying errors from server when the error property exists
 * @param store
 */

const IGNORED_PREFIXS = [
    'SUBMIT_ACTIVITY_ERROR',
    'redux-form'
]

const serverErrorHandler = store => next => action => {
    const shouldDisplayError = action
        && action.error
        && !_.some(IGNORED_PREFIXS, (prefix) => action.type.startsWith(prefix))

    if (shouldDisplayError) {
        const error = _.get(action, 'error.response.data.error', '')

        const message =
            error.msg
            || action.reason
            || `Unknown error for action ${action.type}`

        console.error('ERROR', message, action.error)

        store.dispatch(notify({
            type: 'error',
            message: `${message}${_.endsWith(message, '.') ? '' : '.'}`
        }))
    }

    return next(action)
}

export default serverErrorHandler
