import { createElement } from 'react'

import { isCallActive } from '@repo/utils'
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import rateLimit from 'axios-rate-limit'

import { toast } from '@gorgias/axiom'

const client = createClient()

const newReleaseToastId = 'new-release-notification'
const newReleaseMessage =
    'An update is available for Gorgias. The app will reload automatically.'
const reloadDelay = 60000

export default client

export const timeoutTime = 10800000

let reloadTimeout: ReturnType<typeof setTimeout> | null = null

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

const showNewReleaseToast = () => {
    toast.warning(newReleaseMessage, {
        id: newReleaseToastId,
        duration: reloadDelay,
        actions: ({ id }) =>
            createElement(
                'button',
                {
                    onClick: () => {
                        toast.dismiss(id)
                        window.location.reload()
                    },
                    type: 'button',
                },
                'Reload',
            ),
    })
}

export function handleNewRelease() {
    return (response: AxiosResponse) => {
        const newRelease = (
            response.headers as { 'x-gorgias-release'?: string }
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
                showNewReleaseToast()

                setTimeout(() => {
                    if (!isCallActive()) {
                        toast.dismiss(newReleaseToastId)
                        window.location.reload()
                    } else {
                        reloadTimeout = null
                    }
                }, reloadDelay)
            }, timeoutTime)
        }

        return response
    }
}

export const initializeNewReleaseHandler = () => {
    client.interceptors.response.use(handleNewRelease())
}
