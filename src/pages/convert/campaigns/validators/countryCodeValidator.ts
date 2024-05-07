import {ValidatorType} from './types'
import {ValidationError} from './validationError'

export const countryCodeValidator: ValidatorType = (value) => {
    if (value.length === 0) {
        throw new ValidationError('Value is required')
    }

    return true
}
