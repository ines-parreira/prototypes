import {isEmail} from 'utils'

export const emptyError = (
    value: string,
    fieldName: string
): string | undefined => {
    return value === '' ? `${fieldName} cannot be empty` : undefined
}

export const emailError = (value: string): string | undefined => {
    return !isEmail(value)
        ? 'Email format must include @ and a domain, e.g. example@domain.com.'
        : undefined
}

const canadianPostalCoderegex = new RegExp(/^\w\d\w\d\w\d$/i)

export const validatePostalCode = (
    postalCode: string | undefined,
    country_code: string
): string | undefined => {
    const noError = undefined
    const error = 'Postal code is invalid'

    if (postalCode === undefined) {
        if (country_code === undefined) {
            return noError
        }
        return error
    }

    const postalCodeTrimmed = postalCode.replace(/ /g, '')

    if (country_code === 'US') {
        // US postal codes inclusively go from 00501 to 99500
        return postalCodeTrimmed.length === 5 &&
            !isNaN(Number(postalCodeTrimmed)) &&
            501 <= parseInt(postalCodeTrimmed) &&
            parseInt(postalCodeTrimmed) <= 99950
            ? noError
            : error
    }

    if (country_code === 'CA') {
        // canadian postal codes are of the form A1A 1A1
        return postalCodeTrimmed.length === 6 &&
            canadianPostalCoderegex.test(postalCodeTrimmed)
            ? noError
            : error
    }

    return noError
}
