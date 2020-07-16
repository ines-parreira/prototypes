import * as Sentry from '@sentry/react'

/**
 * Middleware sending redux errors to Sentry
 */
const crashReporter = () => (next) => (action) => {
    try {
        if (action.type) {
            Sentry.addBreadcrumb({
                category: 'redux',
                message: action.type,
            })
        }

        return next(action)
    } catch (err) {
        console.error('Reporting error to Sentry:', err)

        // Send the report
        // whole state is too big, can not be sent
        // state: store.getState()
        // If the action holds error.response.headers object, send x-request-id to sentry
        let customTags = {}
        if (
            action.error &&
            action.error.response &&
            action.error.response.headers
        ) {
            customTags = {
                XRequestID: action.error.response.headers['x-request-id'],
            }
        }

        Sentry.withScope((scope) => {
            scope.setExtras(action)
            scope.setTags(customTags)
            Sentry.captureException(err)
        })
    }
}

export default crashReporter
