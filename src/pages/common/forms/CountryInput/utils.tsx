import { countries, Country } from 'config/countries'

export const getCountrySelectOptions = (
    supportedCountryCodes: Country[],
    allowedCountryCodes?: string[],
): Country[] => {
    if (allowedCountryCodes) {
        return supportedCountryCodes.filter((country) =>
            allowedCountryCodes.includes(country.value),
        )
    }
    return countries
}

export const getCountryLabel = (countryCode: string): string => {
    return (
        countries.find((country) => {
            return country.value === countryCode
        })?.label || ''
    )
}
