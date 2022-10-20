import _some from 'lodash/some'
import _get from 'lodash/get'
import {Middleware} from 'redux'

import {errorToChildren, stripErrorMessage} from '../../utils'
import {notify} from '../../state/notifications/actions'
import {
    GorgiasApiError,
    GorgiasApiResponseDataError,
} from '../../models/api/types'
import {Notification, NotificationStatus} from '../../state/notifications/types'
import {RootState, StoreDispatch} from '../../state/types'

const IGNORED_PREFIXES = ['SUBMIT_ACTIVITY_ERROR']

export type ServerErrorAction = {
    type: string
    reason?: string
    error?: GorgiasApiError
    verbose?: boolean
    children?: string | null
}

const serverErrorHandler: Middleware<
    Record<string, unknown>,
    RootState,
    StoreDispatch
> = (store) => (next) => (action: ServerErrorAction) => {
    const status = _get(action, 'error.response.status', '')
    const error = _get(action, 'error.response.data.error', '') as
        | GorgiasApiResponseDataError
        | ''

    // notify user and redirect him to the login page when his session has expired
    if ([401, 419].includes(status)) {
        if (error) {
            let msg = error.msg
            if (status === 419 && !msg.includes('redirected')) {
                msg +=
                    ' You will be redirected to the login page in a few seconds.'
            }
            void store.dispatch(
                notify({
                    status: NotificationStatus.Error,
                    title: msg,
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
        !_some(IGNORED_PREFIXES, (prefix) => action.type.startsWith(prefix))

    if (shouldDisplayError) {
        let title =
            (error as GorgiasApiResponseDataError).msg ||
            action.reason ||
            `Unknown error for action ${action.type}`

        console.error('ERROR', title, action.error)

        title = stripErrorMessage(title)

        const notification: Notification = {
            status: NotificationStatus.Error,
            allowHTML: true,
            title,
        }

        if (action.verbose) {
            action.children = errorToChildren(action.error!)
        }

        if (action.children) {
            notification.message = action.children
        }

        void store.dispatch(notify(notification))
    }

    return next(action)
}

export default serverErrorHandler
