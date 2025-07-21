import { usePhoneNumberCapabilitiesMap } from 'models/phoneNumber/queries'
import {
    CountryPhoneCapabilities,
    PhoneCountry,
} from 'models/phoneNumber/types'

export function usePhoneNumberCapabilities({
    country,
}: {
    country: PhoneCountry
}): Maybe<CountryPhoneCapabilities> {
    const query = usePhoneNumberCapabilitiesMap()
    const capabilities = query.data

    const countryCapabilities = capabilities?.[country]

    if (!countryCapabilities) {
        return null
    }

    return countryCapabilities
}
