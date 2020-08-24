import _some from 'lodash/some'
import _get from 'lodash/get'

import {stripErrorMessage, errorToChildren} from '../../utils'
import {notify} from '../../state/notifications/actions.ts'

/**
 * Middleware displaying errors from server when the error property exists
 * @param store
 */

const IGNORED_PREFIXS = ['SUBMIT_ACTIVITY_ERROR']

const serverErrorHandler = (store) => (next) => (action) => {
    const status = _get(action, 'error.response.status', '')
    const error = _get(action, 'error.response.data.error', '')

    // notify user and redirect him to the login page when his session has expired
    if ([401, 419].includes(status)) {
        if (error.msg) {
            store.dispatch(
                notify({
                    status: 'error',
                    title: error.msg,
                })
            )
        }

        setTimeout(() => {
            window.location.href = `${window.location.origin}/login`
        }, 3000)

        return next(action)
    }

    const shouldDisplayError =
        action &&
        (action.error || action.reason) &&
        !_some(IGNORED_PREFIXS, (prefix) => action.type.startsWith(prefix))

    if (shouldDisplayError) {
        let title =
            error.msg ||
            action.reason ||
            `Unknown error for action ${action.type}`

        console.error('ERROR', title, action.error)

        title = stripErrorMessage(title)

        const notification = {
            status: 'error',
            allowHTML: true,
            title,
        }

        if (action.verbose) {
            action.children = errorToChildren(action.error)
        }

        if (action.children) {
            notification.message = action.children
        }

        store.dispatch(notify(notification))
    }

    return next(action)
}

export default serverErrorHandler
