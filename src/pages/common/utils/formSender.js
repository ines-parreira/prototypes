import {SubmissionError} from 'redux-form'
import _get from 'lodash/get'

/**
 * Function to return to the onSubmit function of a form using Redux-form
 * Catch errors from incoming promise and display server errors on fields
 * The incoming promise has to return errors in an object on reject
 * @param incomingPromise
 * @returns {Promise}
 */
const formSender = (incomingPromise) => {
    // building a form promise reacting to the form API call result
    let formPromise = new Promise((resolve, reject) => {
        if (!(incomingPromise && incomingPromise.then)) {
            console.error('The function entering "formSender" is not a promise')
            return
        }

        incomingPromise
            .then((response = {}) => {
                const errors = _get(response, 'error.response.data.error.data', '')

                // if errors from API, reject the form promise
                if (errors) {
                    return reject(errors)
                }

                return resolve(response)
            })
    })

    formPromise = formPromise
        .catch((errors = {}) => {
            // catching form validation errors and sending them to Redux form
            console.info('Form received some validation errors from server', errors)
            throw new SubmissionError(errors)
        })

    return formPromise
}

export default formSender
