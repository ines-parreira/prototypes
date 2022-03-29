import {
    PhoneCountry,
    PhoneType,
    PhoneCapabilities,
} from 'models/phoneNumber/types'

import {usePhoneCapabilitiesLimitationsMap} from 'hooks/integrations/phone/usePhoneCapabilitiesLimitationsMap'

export function usePhoneNumberCapabilities({
    country,
    type,
}: {
    country: PhoneCountry
    type: PhoneType
}): Maybe<PhoneCapabilities> {
    const capabilities = usePhoneCapabilitiesLimitationsMap()
    const countryCapabilities = capabilities[country]

    if (!countryCapabilities) {
        return null
    }

    if (!countryCapabilities[type]) {
        return null
    }

    return countryCapabilities[type]
}
