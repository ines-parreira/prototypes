import React from 'react'
import {PhoneNumber} from 'models/phoneNumber/types'

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
    return (
        <div className={css.wrapper}>
            <CountryFlag
                countryCode={phoneNumber.meta.country}
                withRoundFlag={withRoundFlag}
            />
            &nbsp;
            <strong>
                {phoneNumber.name}
                {withCountryCode && ` - ${phoneNumber.meta.country}`}
            </strong>
            &nbsp;
            <span>{phoneNumber.meta.friendly_name}</span>
        </div>
    )
}
