import React, {useMemo} from 'react'

import {getViewLanguage, changeViewLanguage} from 'state/ui/helpCenter'

import SelectField from 'pages/common/forms/SelectField/SelectField'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {validLocaleCode} from 'models/helpCenter/utils'
import {getLocaleSelectOptions} from '../../utils/localeSelectOptions'
import {useSupportedLocales} from '../../providers/SupportedLocales'
import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../constants'

export const LanguageSelect: React.FC = () => {
    const dispatch = useAppDispatch()
    const helpCenter = useCurrentHelpCenter()
    const locales = useSupportedLocales()
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    const localeOptions = useMemo(
        () => getLocaleSelectOptions(locales, helpCenter.supported_locales),
        [locales, helpCenter.supported_locales]
    )

    const handleOnChangeLocale = (value: React.ReactText) => {
        dispatch(changeViewLanguage(validLocaleCode(value)))
    }

    return (
        <SelectField
            value={viewLanguage}
            options={localeOptions}
            onChange={handleOnChangeLocale}
            aria-label="language selector"
        />
    )
}

export default LanguageSelect
