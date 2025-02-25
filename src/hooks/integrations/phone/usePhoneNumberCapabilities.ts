import { usePhoneNumberCapabilitiesMap } from 'models/phoneNumber/queries'
import {
    PhoneCapabilities,
    PhoneCountry,
    PhoneType,
} from 'models/phoneNumber/types'

export function usePhoneNumberCapabilities({
    country,
    type,
}: {
    country: PhoneCountry
    type: PhoneType
}): Maybe<PhoneCapabilities> {
    const query = usePhoneNumberCapabilitiesMap()
    const capabilities = query.data

    const countryCapabilities = capabilities?.[country]

    if (!countryCapabilities) {
        return null
    }

    if (!countryCapabilities[type]) {
        return null
    }

    return countryCapabilities[type]
}
