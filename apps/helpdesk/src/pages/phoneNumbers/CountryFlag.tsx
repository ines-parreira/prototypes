import classnames from 'classnames'
import type { CountryCode } from 'libphonenumber-js'
import { ReactCountryFlag } from 'react-country-flag'

import css from './CountryFlag.less'

type Props = {
    countryCode: Maybe<CountryCode>
    withRoundFlag?: boolean
    id?: string
}

export function CountryFlag({
    countryCode,
    withRoundFlag,
    id,
}: Props): JSX.Element {
    return (
        <div
            className={classnames(css.wrapper, { [css.round]: withRoundFlag })}
            id={id}
        >
            {countryCode && <ReactCountryFlag countryCode={countryCode} />}
        </div>
    )
}

export default CountryFlag
