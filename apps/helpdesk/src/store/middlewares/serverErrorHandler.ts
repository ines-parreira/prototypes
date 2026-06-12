import _get from 'lodash/get'
import _some from 'lodash/some'
import type { Middleware } from 'redux'
import { Duration } from '@gorgias/toolkit'

import type {
    GorgiasApiError,
    GorgiasApiResponseDataError,
} from '../../models/api/types'
import { isIntegrationLimitReachedError } from '../../models/api/types'
import { notify } from '../../state/notifications/actions'
import type { Notification } from '../../state/notifications/types'
import { NotificationStatus } from '../../state/notifications/types'
import type { RootState, StoreDispatch } from '../../state/types'
import { errorToChildren, stripErrorMessage } from '../../utils'

const IGNORED_PREFIXES = ['SUBMIT_ACTIVITY_ERROR']

const BILLING_SETTINGS_PATH = '/app/settings/billing'

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
                }),
            )
        }

        setTimeout(() => {
            const nextPath =
                window.location.pathname +
                window.location.search +
                window.location.hash
            const loginUrl = `${window.location.origin}/login?next=${encodeURIComponent(nextPath)}`

            window.location.href = loginUrl
        }, Duration.seconds(3))

        return next(action)
    }

    // Handle the per-account integration limit specifically: render an actionable
    // notification with the resolved limit, and route enterprise/legacy accounts
    // (`upgradable: false`) to CSM contact instead of the self-serve upgrade path.
    if (isIntegrationLimitReachedError(action.error)) {
        const { limit, upgradable } = action.error.response.data.error.data
        void store.dispatch(
            notify({
                status: NotificationStatus.Error,
                title: `You've reached your plan's limit of ${limit} channels.`,
                message: upgradable
                    ? 'Upgrade your plan to add more channels.'
                    : 'Reach out to your Customer Success Manager to raise your limit.',
                buttons: [
                    {
                        name: upgradable ? 'Upgrade plan' : 'Contact us',
                        primary: true,
                        onClick: () => {
                            window.location.assign(BILLING_SETTINGS_PATH)
                        },
                    },
                ],
            }),
        )
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

export { serverErrorHandler }
