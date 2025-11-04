import {
    CountryCallingCode,
    CountryCode,
    getCountryCallingCode,
    isSupportedCountry,
} from 'libphonenumber-js'

export type Country = {
    value: CountryCode
    label: string
}

export type PhoneCallingCodeOption = {
    id: CountryCode
    label: JSX.Element
    text: string
    value: CountryCode
}

export const getCountryCountryCallingCodeSelectOptions = (
    supportedCountryCodes: Country[],
    allowedCountryCodes?: CountryCode[],
): PhoneCallingCodeOption[] => {
    if (allowedCountryCodes) {
        return supportedCountryCodes
            .filter((country) => allowedCountryCodes.includes(country.value))
            .map(countryCountryCallingCodeToSelectOption)
    }
    return supportedCountryCodes
        .filter((country) => isSupportedCountry(country.value)) // Don't pass countries that aren't supported by libphonenumber-js as we will fail to format.
        .map(countryCountryCallingCodeToSelectOption)
}

export const countryCountryCallingCodeToSelectOption = (
    country: Country,
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
})

// NOTE. This is a workaround to support some unhandled countries from `libphonenumber-js`.
export const getCountryCallingCodeFixed = (
    countryCode: CountryCode,
): CountryCallingCode => {
    // Source: https://en.wikipedia.org/wiki/List_of_country_calling_codes
    switch (countryCode as string) {
        case 'AQ':
            return '672' as CountryCallingCode
        case 'PN':
            return '64' as CountryCallingCode
        case 'BV':
            return '47' as CountryCallingCode
        case 'TF':
            return '262' as CountryCallingCode
        case 'HM':
            return '672' as CountryCallingCode
        case 'GS':
            return '500' as CountryCallingCode
        case 'UM':
            return '1' as CountryCallingCode
        default:
            // Fallback to `libphonenumber-js` for the rest.
            return getCountryCallingCode(countryCode)
    }
}
