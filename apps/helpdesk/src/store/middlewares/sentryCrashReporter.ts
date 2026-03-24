import { reportError } from '@repo/logging'
import * as Sentry from '@sentry/react'
import type { AxiosError } from 'axios'
import type { Middleware } from 'redux'

/**
 * Middleware sending redux errors to Sentry
 */
const crashReporter: Middleware =
    () => (next) => (action: { type: string; error?: AxiosError }) => {
        try {
            if (action.type) {
                Sentry.addBreadcrumb({
                    category: 'redux',
                    message: action.type,
                })
            }

            return next(action)
        } catch (err) {
            // Send the report
            // whole state is too big, can not be sent
            // state: store.getState()
            // If the action holds error.response.headers object, send x-request-id to sentry
            let customTags = {}
            if (action.error?.response?.headers) {
                customTags = {
                    XRequestID: (
                        action.error.response.headers as Record<string, unknown>
                    )['x-request-id'],
                }
            }
            reportError(err, {
                extra: action,
                tags: customTags,
            })
        }
    }

export default crashReporter
