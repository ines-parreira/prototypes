import {SubmissionError} from 'redux-form'
import _get from 'lodash/get'
import _first from 'lodash/first'
import _isString from 'lodash/isString'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _compact from 'lodash/compact'
import _map from 'lodash/map'
import _forEach from 'lodash/forEach'
import _flattenDeep from 'lodash/flattenDeep'

/**
 * Format errors to be readable and displayable easily as errors in components
 * At the end we want an object with keys (names of fields) having a string or an array of strings, like :
 * {username: 'User does not exist', email: ['Invalid email address', 'Email address too stupid, sorry']}
 * @param errors
 * @returns {*}
 */
const formatErrors = (errors) => {
    if (!errors) {
        return ''
    }

    if (_isObject(errors)) {
        const firstKey = _first(Object.keys(errors))
        // if first key is not a number or a system property (starting by "_")
        const shouldBeFlattened = !isNaN(firstKey) || firstKey.startsWith('_')

        if (shouldBeFlattened) {
            return _compact(_flattenDeep(_map(errors, error => formatErrors(error))))
        }

        // this object should not be flattened (nested errors)
        _forEach(errors, (error, key) => {
            errors[key] = formatErrors(error)
        })
        return errors
    }

    if (_isArray(errors)) {
        return _compact(_flattenDeep(errors.map(error => formatErrors(error))))
    }

    if (_isString(errors)) {
        return errors
    }

    return errors
}

/**
 * Function to return to the onSubmit function of a form using Redux-form
 * Catch errors from incoming promise and display server errors on fields
 * The incoming promise has to return errors in an object on reject
 * @param incomingPromise
 * @param options :
    * globals - array of strings of names of fields which errors will be set as "global" form errors instead of by field
 * @returns {Promise}
 */
const formSender = (incomingPromise, options = {}) => {
    // building a form promise reacting to the form API call result
    let formPromise = new Promise((resolve, reject) => {
        if (!(incomingPromise && incomingPromise.then)) {
            console.error('The function entering "formSender" is not a promise')
            return
        }

        incomingPromise
            .then((response = {}) => {
                const errors = _get(response, 'error.response.data.error')

                // if errors from API, reject the form promise
                if (errors) {
                    const fieldsErrors = _get(errors, 'data', {})
                    const message = _get(errors, 'msg', '')

                    // if there is no global form error, let's put the error message in there
                    if (!fieldsErrors._error && message) {
                        fieldsErrors._error = [message]
                    }

                    return reject(formatErrors(fieldsErrors))
                }

                return resolve(response)
            })
    })

    formPromise = formPromise
        .catch((errors = {}) => {
            // catching form validation errors and sending them to Redux form
            console.info('Form received some validation errors from server', errors)

            // for each field that should be bubbled as global form errors,
            // put them in _error which is the name of the global form error property for redux-form
            if (options.globals) {
                let globals = options.globals || []

                if (!_isArray(globals)) {
                    globals = [globals]
                }

                if (globals.length) {
                    // keep existing global error or take an empty array
                    errors._error = errors._error || []

                    globals.forEach(global => errors._error.push(errors[global]))

                    errors._error = _flattenDeep(_compact(errors._error))
                }
            }

            throw new SubmissionError(errors)
        })

    return formPromise
}

export default formSender
