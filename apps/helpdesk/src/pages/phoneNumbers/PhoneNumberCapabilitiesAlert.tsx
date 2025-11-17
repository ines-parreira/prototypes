import { Banner } from '@gorgias/axiom'

import { usePhoneNumberCapabilities } from 'hooks/integrations/phone/usePhoneNumberCapabilities'
import type { PhoneCountry, PhoneType } from 'models/phoneNumber/types'

import {
    getCountryCapabilityLimitationsMessage,
    getLimitationsMessageForType,
} from './utils'

type Props = {
    country: PhoneCountry
    type?: PhoneType
}

export default function PhoneNumberCapabilitiesAlert({
    country,
    type,
}: Props): JSX.Element | null {
    const capabilites = usePhoneNumberCapabilities({
        country,
    })

    if (!capabilites) {
        return null
    }

    if (type) {
        const limitationsMessageForType = getLimitationsMessageForType(
            country,
            type,
            capabilites,
        )

        return limitationsMessageForType ? (
            <Banner type={'warning'} className="mt-3 mb-4">
                {limitationsMessageForType}
            </Banner>
        ) : null
    }

    const missingCapabilities = getCountryCapabilityLimitationsMessage(
        country,
        capabilites,
    )

    if (missingCapabilities.length === 0) {
        return null
    }

    return (
        <Banner type={'warning'} className="mt-3 mb-4">
            {missingCapabilities.map((capability) => (
                <div key={capability}>{capability}</div>
            ))}
        </Banner>
    )
}
