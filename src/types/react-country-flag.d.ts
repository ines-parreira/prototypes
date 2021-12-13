declare module 'react-country-flag' {
    import * as React from 'react'
    import {CountryCode} from 'libphonenumber-js'

    export type Props = {
        countryCode: CountryCode
        style?: React.CSSProperties
        svg?: boolean
        cdnSuffix?: string
        cdnUrl?: string
    }

    const ReactCountryFlag: (props: Props) => JSX.Element
    export default ReactCountryFlag
}
