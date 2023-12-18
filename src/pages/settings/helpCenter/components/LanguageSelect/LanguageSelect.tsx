import React, {useMemo} from 'react'

import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Value} from 'pages/common/forms/SelectField/types'
import useCurrentHelpCenter from '../../hooks/useCurrentHelpCenter'
import {useSupportedLocales} from '../../providers/SupportedLocales'
import {getLocaleSelectOptions} from '../../utils/localeSelectOptions'

type Props = {
    value?: Value | null
    onChange: (value: Value) => void
    fullWidth?: boolean
    className?: string
}
export const LanguageSelect: React.FC<Props> = (props) => {
    const helpCenter = useCurrentHelpCenter()
    const locales = useSupportedLocales()

    const localeOptions = useMemo(
        () => getLocaleSelectOptions(locales, helpCenter.supported_locales),
        [locales, helpCenter.supported_locales]
    )

    return (
        <SelectField
            fixedWidth
            options={localeOptions}
            aria-label="language selector"
            style={props.fullWidth ? {} : {width: '140px'}}
            {...props}
        />
    )
}

export default LanguageSelect
