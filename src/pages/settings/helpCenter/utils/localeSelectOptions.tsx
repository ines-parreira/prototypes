import React from 'react'

import {Locale, LocaleCode} from '../../../../models/helpCenter/types'
import {FlagLanguageItem} from '../../../common/components/LanguageBulletList'

export type LocaleOption = {
    id: LocaleCode
    label: JSX.Element
    text: string
    value: LocaleCode
}

export const getLocaleSelectOptions = (
    supportedLocales: Locale[],
    helpCenterLocales: LocaleCode[]
): LocaleOption[] => {
    return supportedLocales
        .filter((locale) => helpCenterLocales.includes(locale.code))
        .map(localeToSelectOption)
}

export const localeToSelectOption = (locale: Locale): LocaleOption => ({
    id: locale.code,
    label: <FlagLanguageItem code={locale.code} name={locale.name} />,
    text: locale.name,
    value: locale.code,
})
