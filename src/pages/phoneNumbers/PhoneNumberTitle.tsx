import React from 'react'
import {NewPhoneNumber} from 'models/phoneNumber/types'

import {countryCode} from './utils'
import CountryFlag from './CountryFlag'

import css from './PhoneNumberTitle.less'

type Props = {
    phoneNumber: NewPhoneNumber
    withRoundFlag?: boolean
    withCountryCode?: boolean
}

export default function PhoneNumberTitle({
    phoneNumber,
    withRoundFlag,
    withCountryCode,
}: Props): JSX.Element {
    const phoneCountryCode = countryCode(phoneNumber)
    return (
        <div className={css.wrapper}>
            {phoneCountryCode && (
                <CountryFlag
                    countryCode={phoneCountryCode}
                    withRoundFlag={withRoundFlag}
                />
            )}
            <strong>
                {phoneNumber.name}
                {withCountryCode &&
                    phoneCountryCode &&
                    ` - ${phoneCountryCode}`}
            </strong>
            &nbsp;
            <span>{phoneNumber.phone_number_friendly}</span>
        </div>
    )
}
