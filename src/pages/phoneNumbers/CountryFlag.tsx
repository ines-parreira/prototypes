import React from 'react'
import ReactCountryFlag from 'react-country-flag'
import classnames from 'classnames'

import {CountryCode} from 'libphonenumber-js'

import css from './CountryFlag.less'

type Props = {
    countryCode: Maybe<CountryCode>
    withRoundFlag?: boolean
}

export function CountryFlag({countryCode, withRoundFlag}: Props): JSX.Element {
    return (
        <div className={classnames(css.wrapper, {[css.round]: withRoundFlag})}>
            {countryCode && <ReactCountryFlag countryCode={countryCode} />}
        </div>
    )
}

export default CountryFlag
