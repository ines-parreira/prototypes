import axios, {AxiosResponse} from 'axios'
import rateLimit from 'axios-rate-limit'
import {Store} from 'redux'

import {notify} from '../../state/notifications/actions'
import {NotificationStatus} from '../../state/notifications/types'
import {StoreDispatch} from '../../state/types'

const client = rateLimit(axios.create(), {
    maxRequests: 10,
    perMilliseconds: 1000,
})

const commonHeaders = (client.defaults.headers as Record<string, unknown>)
    .common as Record<string, unknown>
commonHeaders['X-CSRF-Token'] = window.CSRF_TOKEN
commonHeaders['X-Gorgias-User-Client'] = 'web'

export function handleNewRelease(store: Store) {
    const dispatch = store.dispatch as StoreDispatch

    return (response: AxiosResponse) => {
        const newRelease = (response.headers as {'x-gorgias-release': string})[
            'x-gorgias-release'
        ]

        if (newRelease && newRelease !== window.GORGIAS_RELEASE) {
            setTimeout(() => {
                void dispatch(
                    notify({
                        style: 'banner',
                        status: NotificationStatus.Info,
                        dismissible: false,
                        onClick: () => {
                            window.location.reload()
                        },
                        allowHTML: true,
                        message: `An update is available for Gorgias. Click <a>here</a> to reload the page and get the
        latest improvements.`,
                    })
                )

                setTimeout(() => {
                    void dispatch(
                        notify({
                            dismissAfter: 0,
                            status: NotificationStatus.Warning,
                            dismissible: false,
                            allowHTML: true,
                            message:
                                'An update is available for Gorgias. The app will be reloaded automatically in few seconds.',
                            buttons: [
                                {
                                    name: 'Reload',
                                    primary: true,
                                    onClick: () => {
                                        window.location.reload()
                                    },
                                },
                            ],
                        })
                    )

                    setTimeout(() => {
                        window.location.reload()
                    }, 60000)
                }, 10800000) // 3 hours
            }, 15000)
        }

        return response
    }
}

export const initializeNewReleaseHandler = (store: Store) => {
    client.interceptors.response.use(handleNewRelease(store))
}

export default client
