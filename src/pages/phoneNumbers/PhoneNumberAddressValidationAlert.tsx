import React from 'react'
import {PhoneCountry} from 'models/phoneNumber/types'

import Alert from 'pages/common/components/Alert/Alert'
import {shouldValidateAddress, countryName} from 'pages/phoneNumbers/utils'

type Props = {
    country: Maybe<PhoneCountry>
}

export default function PhoneNumberAddressValidationAlert({
    country,
}: Props): JSX.Element | null {
    if (!country || !shouldValidateAddress(country)) {
        return null
    }

    return country === PhoneCountry.FR ? (
        <Alert icon className="mt-3 mb-4">
            French numbers are only available through the{' '}
            <a
                href="https://gorgias.typeform.com/to/YhvfA3qK"
                target="_blank"
                rel="noopener noreferrer"
            >
                French number request form.
            </a>
        </Alert>
    ) : (
        <Alert icon className="mt-3 mb-4">
            Creating phone numbers from {countryName(country)} requires address
            verification
        </Alert>
    )
}
