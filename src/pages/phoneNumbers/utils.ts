import {PhoneCountry} from 'models/phoneNumber/types'
import rawCountries from 'pages/phoneNumbers/options/countries.json'

export function shouldValidateAddress(country: PhoneCountry): boolean {
    return (
        country === PhoneCountry.GB ||
        country === PhoneCountry.AU ||
        country === PhoneCountry.FR
    )
}

export function countryName(country: PhoneCountry): string {
    const countryOption = rawCountries.find((c) => c.value === country)
    if (countryOption) {
        return countryOption.label
    }

    return country
}
