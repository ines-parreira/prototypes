import _isUndefined from 'lodash/isUndefined'

const Raven = window.Raven

/**
 * Middleware sending redux errors to Sentry
 */
const crashReporter = () => (next) => (action) => {
    if (_isUndefined(Raven)) {
        return next(action)
    }

    try {
        if (action.type) {
            Raven.captureBreadcrumb({
                category: 'redux',
                message: action.type
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
        if (action.error && action.error.response && action.error.response.headers) {
            customTags = {'XRequestID' : action.error.response.headers['x-request-id']}
        }
        Raven.captureException(err, {
            extra: action,
            tags: customTags
        })
    }
}

export default crashReporter
