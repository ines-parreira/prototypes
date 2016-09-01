import {isUndefined as _isUndefined} from 'lodash'

const Raven = window.Raven

/**
 * Middleware sending redux errors to Sentry
 */
const crashReporter = () => next => action => {
    if (_isUndefined(Raven)) {
        return next(action)
    }

    try {
        if (action.type && !~action.type.indexOf('SUBMIT_ACTIVITY')) {
            Raven.captureBreadcrumb({
                category: 'redux',
                message: action.type
            })
        }

        return next(action)
    } catch (err) {
        console.error('Reporting error to Sentry:', err)

        // Send the report.
        Raven.captureException(err, {
            extra: {
                actionType: action.type,
                // whole state is too big, can not be sent
                // state: store.getState()
            }
        })
    }
}

export default crashReporter
