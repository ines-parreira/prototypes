import { isCallActive } from '@repo/utils'
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import rateLimit from 'axios-rate-limit'
import { Duration } from '@gorgias/toolkit'

import { Button, toast } from '@gorgias/axiom'

const client = createClient()

const newReleaseToastId = 'new-release-notification'
const newReleaseTitle = 'An update is available for Gorgias'
const newReleaseCaption = 'The app will reload automatically.'
const reloadDelay = Duration.minutes(1)

export default client

export const timeoutTime = Duration.hours(3)

let reloadTimeout: ReturnType<typeof setTimeout> | null = null
let autoReloadTimeout: ReturnType<typeof setTimeout> | null = null

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
            perMilliseconds: Duration.seconds(1),
        },
    )
}

const showNewReleaseToast = () => {
    toast.warning(newReleaseTitle, {
        id: newReleaseToastId,
        caption: newReleaseCaption,
        duration: reloadDelay,
        actions: ({ id }) => (
            <>
                <Button
                    size="sm"
                    onClick={() => {
                        toast.dismiss(id)
                        window.location.reload()
                    }}
                >
                    Reload
                </Button>
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                        toast.dismiss(id)
                        if (autoReloadTimeout) {
                            clearTimeout(autoReloadTimeout)
                            autoReloadTimeout = null
                        }
                        reloadTimeout = null
                    }}
                >
                    Cancel
                </Button>
            </>
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

                autoReloadTimeout = setTimeout(() => {
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
