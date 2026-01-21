import { isCallActive } from '@repo/utils'
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import rateLimit from 'axios-rate-limit'
import type { Store } from 'redux'

import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { StoreDispatch } from 'state/types'

const client = createClient()

export default client

export const initializeNewReleaseHandler = (store: Store) => {
    client.interceptors.response.use(handleNewRelease(store))
}

export function createClient() {
    return rateLimit(
        // eslint-disable-next-line no-restricted-properties
        axios.create({
            headers: {
                'X-CSRF-Token': window.CSRF_TOKEN,
                'X-Gorgias-User-Client': 'web',
            },
        }),
        {
            maxRequests: 10,
            perMilliseconds: 1000,
        },
    )
}

export const timeoutTime = 10800000
let reloadTimeout: NodeJS.Timeout | null

export function handleNewRelease(store: Store) {
    const dispatch = store.dispatch as StoreDispatch

    return (response: AxiosResponse) => {
        const newRelease = (
            response.headers as { 'x-gorgias-release': string }
        )['x-gorgias-release']

        if (
            newRelease &&
            newRelease !== window.GORGIAS_RELEASE &&
            !reloadTimeout
        ) {
            if (isCallActive()) {
                return response
            }

            reloadTimeout = setTimeout(() => {
                void dispatch(
                    notify({
                        id: 'new-release-notification',
                        dismissAfter: 0,
                        status: NotificationStatus.Warning,
                        dismissible: false,
                        allowHTML: true,
                        message:
                            'An update is available for Gorgias. The app will reload automatically.',
                        buttons: [
                            {
                                name: 'Reload',
                                primary: true,
                                onClick: () => {
                                    window.location.reload()
                                },
                            },
                        ],
                    }),
                )

                setTimeout(() => {
                    if (!isCallActive()) {
                        window.location.reload()
                    } else {
                        reloadTimeout = null
                    }
                }, 60000)
            }, timeoutTime)
        }

        return response
    }
}
