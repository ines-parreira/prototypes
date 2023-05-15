import {CountryCode} from 'libphonenumber-js'

export const extractCountryCodeFromTemplate = (
    countryCode: string
): CountryCode => {
    const parts = countryCode.split('_')

    return (parts[1] ?? parts[0]) as CountryCode
}
