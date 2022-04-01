import {
    PhoneNumber,
    PhoneCountry,
    PhoneCapabilities,
} from 'models/phoneNumber/types'

import {IntegrationType} from 'models/integration/types'
import rawCountries from 'pages/phoneNumbers/options/countries.json'

const CAPABILITY_KEY: Record<
    IntegrationType.Sms | IntegrationType.Phone,
    keyof PhoneCapabilities
> = {
    [IntegrationType.Sms]: 'sms',
    [IntegrationType.Phone]: 'voice',
}

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

export function hasCapability(
    phoneNumber: PhoneNumber,
    integrationType: IntegrationType.Sms | IntegrationType.Phone
): boolean {
    return !!phoneNumber.capabilities[CAPABILITY_KEY[integrationType]]
}
