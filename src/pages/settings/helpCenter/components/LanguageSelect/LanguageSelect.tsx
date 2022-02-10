import React, {useMemo} from 'react'
import {useSelector} from 'react-redux'

import {getViewLanguage, changeViewLanguage} from 'state/helpCenter/ui'

import SelectField from '../../../../common/forms/SelectField/SelectField'
import {getLocaleSelectOptions} from '../../utils/localeSelectOptions'
import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {useSupportedLocales} from '../../providers/SupportedLocales'
import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../constants'
import {validLocaleCode} from '../../../../../models/helpCenter/utils'

export const LanguageSelect: React.FC = () => {
    const dispatch = useAppDispatch()
    const helpCenter = useCurrentHelpCenter()
    const locales = useSupportedLocales()
    const viewLanguage =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

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
