import React from 'react'
import {PhoneNumber} from 'models/phoneNumber/types'

import {countryCode, friendlyName} from './utils'
import CountryFlag from './CountryFlag'

import css from './PhoneNumberTitle.less'

type Props = {
    phoneNumber: PhoneNumber
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
            <span>{friendlyName(phoneNumber)}</span>
        </div>
    )
}
