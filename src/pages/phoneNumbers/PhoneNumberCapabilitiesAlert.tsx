import React from 'react'

import {PhoneCountry, PhoneType} from 'models/phoneNumber/types'
import {countryName} from 'pages/phoneNumbers/utils'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {usePhoneNumberCapabilities} from 'hooks/integrations/phone/usePhoneNumberCapabilities'

type Props = {
    country: PhoneCountry
    type: PhoneType
}

export default function PhoneNumberCapabilitiesAlert({
    country,
    type,
}: Props): JSX.Element | null {
    const capabilites = usePhoneNumberCapabilities({
        country,
        type,
    })

    if (!capabilites) {
        return null
    }

    const missingCapabilities = Object.entries(capabilites)
        .filter(([, value]) => !value)
        .map(([capability]) => capability)

    if (!country || !type || !missingCapabilities.length) {
        return null
    }

    return (
        <Alert type={AlertType.Warning} icon className="mt-3 mb-4">
            {missingCapabilities
                .map((capability) => capability.toUpperCase())
                .join(' and ')}{' '}
            {missingCapabilities.length > 1 ? 'are' : 'is'} not currently
            compatible with {type?.toLowerCase()} numbers from{' '}
            {countryName(country)}.
        </Alert>
    )
}
