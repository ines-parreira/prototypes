import _isUndefined from 'lodash/isUndefined'
import {Middleware} from 'redux'
import {AxiosError} from 'axios'

import {reportError} from '../../utils/errors'

const Raven = window.Raven

/**
 * Middleware sending redux errors to Sentry
 */
const crashReporter: Middleware =
    () => (next) => (action: {type: string; error?: AxiosError}) => {
        if (_isUndefined(Raven)) {
            return next(action)
        }

        try {
            if (action.type) {
                Raven.captureBreadcrumb({
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
