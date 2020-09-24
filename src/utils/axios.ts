// The code below checks if we have a new Gorgias release
import axios from 'axios'

import {notify} from '../state/notifications/actions'
import {NotificationStatus} from '../state/notifications/types'
import {StoreDispatch} from '../state/types'

let currentRelease = window.GORGIAS_RELEASE

export const injectInterceptor = () => (dispatch: StoreDispatch) => {
    // intercept xhr requests and check if they have a special HTTP header
    axios.interceptors.response.use(function (response) {
        // see if we have a new release of Gorgias
        const newRelease = (response.headers as {'x-gorgias-release': string})[
            'x-gorgias-release'
        ]

        if (newRelease && newRelease !== currentRelease) {
            currentRelease = newRelease
            // wait 15s after we first see a new release (so that the deployment finishes).
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
    })
}
