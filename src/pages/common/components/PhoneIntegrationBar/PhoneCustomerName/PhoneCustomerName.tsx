import parsePhoneNumber from 'libphonenumber-js'
import React from 'react'

import css from './PhoneCustomerName.less'

type Props = {
    name: Maybe<string>
    phoneNumber: string
}

export default function PhoneCustomerName({
    name,
    phoneNumber,
}: Props): JSX.Element {
    const parsedPhoneNumber = parsePhoneNumber(phoneNumber)
    const formattedPhoneNumber = parsedPhoneNumber?.formatInternational()

    return (
        <span className={css.container}>
            <span className={css.name}>{name}</span> (
            {formattedPhoneNumber || phoneNumber})
        </span>
    )
}
