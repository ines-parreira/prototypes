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
        Raven.captureException(err, {
            extra: action
        })
    }
}

export default crashReporter
