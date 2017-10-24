// @flow
// The code below checks if we have a new Gorgias release
import axios from 'axios'
import {notify} from '../state/notifications/actions'
import type {dispatchType} from '../state/types'

let currentRelease = window.GORGIAS_RELEASE

export const injectInterceptor = () => (dispatch: dispatchType) => {
    // intercept xhr requests and check if they have a special HTTP header
    axios.interceptors.response.use(function (response) {
        // see if we have a new release of Gorgias
        const newRelease = response.headers['x-gorgias-release']

        if (newRelease && newRelease !== currentRelease) {
            currentRelease = newRelease
            // wait 15s after we first see a new release (so that the deployment finishes).
            setTimeout(() => {
                dispatch(notify({
                    style: 'banner',
                    status: 'info',
                    dismissible: false,
                    onClick: () => {
                        window.location.reload()
                    },
                    allowHtml: true,
                    message: `An update is available for Gorgias. Click <a>here</a> to reload the page and get the 
            latest improvements.`
                }))
            }, 15000)
        }
        return response
    })
}
