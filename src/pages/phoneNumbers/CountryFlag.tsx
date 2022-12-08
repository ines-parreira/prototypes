import React from 'react'
import ReactCountryFlag from 'react-country-flag'
import classnames from 'classnames'

import {PhoneCountry} from 'models/phoneNumber/types'

import css from './CountryFlag.less'

type Props = {
    countryCode: PhoneCountry
    withRoundFlag?: boolean
}

export function CountryFlag({countryCode, withRoundFlag}: Props): JSX.Element {
    return (
        <div className={classnames(css.wrapper, {[css.round]: withRoundFlag})}>
            <ReactCountryFlag countryCode={countryCode} />
        </div>
    )
}

export default CountryFlag
