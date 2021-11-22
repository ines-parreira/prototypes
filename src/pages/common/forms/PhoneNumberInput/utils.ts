import {get, toString, parseInt, join, startsWith} from 'lodash'
import parsePhoneNumber, {
    formatIncompletePhoneNumber,
    getCountryCallingCode,
    CountryCode,
    Metadata,
} from 'libphonenumber-js'

export function getCountryFromPhoneNumber(
    number: string
): CountryCode | undefined {
    const parsedNumber = parsePhoneNumber(number)

    if (parsedNumber?.country) {
        return parsedNumber.country
    }

    const metadata = new Metadata()
    const callingCodes = get(metadata, 'metadata.country_calling_codes')

    const callingCode = parsedNumber?.countryCallingCode ?? parseInt(number)

    if (callingCode) {
        return get(callingCodes, [
            toString(callingCode),
            0,
        ]) as unknown as CountryCode
    }

    return undefined
}

export function buildInternationalNumber(
    nationalNumber: string,
    country: CountryCode
): string {
    const callingCode = getCountryCallingCode(country)
    return normalizeNumber(
        join([
            '+',
            toString(callingCode),
            formatAsNationalNumber(nationalNumber, country),
        ])
    )
}

export function formatAsNationalNumber(
    number: string,
    country?: CountryCode
): string {
    if (!startsWith(number, '+')) {
        return number
    }
    const internationalFormatted = formatIncompletePhoneNumber(number, country)
    const segments = internationalFormatted.split(' ')
    segments.shift()
    return join(segments, ' ')
}

export function normalizeNumber(number: string): string {
    const cleanedNumber = number.replace(/[^0-9]/gi, '')
    if (number[0] === '+') {
        return `+${cleanedNumber}`
    }
    return cleanedNumber
}
