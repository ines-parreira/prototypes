import {
    CountryCallingCode,
    CountryCode,
    getCountryCallingCode,
    isSupportedCountry,
} from 'libphonenumber-js'
import React from 'react'

export type Country = {
    value: CountryCode
    label: string
}

export type PhoneCallingCodeOption = {
    id: CountryCode
    label: JSX.Element
    text: string
    value: CountryCode
    isDisabled: boolean
}

export const getCountryCountryCallingCodeSelectOptions = (
    supportedCountryCodes: Country[],
    allowedCountryCodes?: CountryCode[]
): PhoneCallingCodeOption[] => {
    if (allowedCountryCodes) {
        return supportedCountryCodes
            .filter((country) => allowedCountryCodes.includes(country.value))
            .map(countryCountryCallingCodeToSelectOption)
    }
    return supportedCountryCodes.map(countryCountryCallingCodeToSelectOption)
}

export const countryCountryCallingCodeToSelectOption = (
    country: Country
): PhoneCallingCodeOption => ({
    id: country.value,
    label: (
        <span>
            {country.label}{' '}
            <span className="text-muted">
                (+{getCountryCallingCodeFixed(country.value)})
            </span>
        </span>
    ),
    text: country.label,
    value: country.value,
    isDisabled: !isSupportedCountry(country.value), // Disable `libphonenumber-js` unsupported countries to prevent later issues.
})

// NOTE. This is a workaround to support some unhandled countries from `libphonenumber-js`.
export const getCountryCallingCodeFixed = (
    countryCode: CountryCode
): CountryCallingCode => {
    // Source: https://en.wikipedia.org/wiki/List_of_country_calling_codes
    switch (countryCode as string) {
        case 'AQ':
            return '672'
        case 'PN':
            return '64'
        case 'BV':
            return '47'
        case 'TF':
            return '262'
        case 'HM':
            return '672'
        case 'GS':
            return '500'
        case 'UM':
            return '1'
        default:
            // Fallback to `libphonenumber-js` for the rest.
            return getCountryCallingCode(countryCode)
    }
}
