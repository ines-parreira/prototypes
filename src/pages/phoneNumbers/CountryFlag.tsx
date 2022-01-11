import React from 'react'
import ReactCountryFlag from 'react-country-flag'
import {PhoneCountry} from 'models/phoneNumber/types'

import css from './CountryFlag.less'

type Props = {
    countryCode: PhoneCountry
}

export function CountryFlag({countryCode}: Props): JSX.Element {
    return (
        <div className={css.wrapper}>
            <ReactCountryFlag countryCode={countryCode} />
        </div>
    )
}

export default CountryFlag
