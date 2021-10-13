import React from 'react'

import {HelpCenterLocale, LocaleCode} from '../../../../models/helpCenter/types'
import {FlagLanguageItem} from '../../../common/components/LanguageBulletList'

export type LocaleOption = {
    label: JSX.Element
    text: string
    value: LocaleCode
}

export const useLocaleSelectOptions = (
    supportedLocales: HelpCenterLocale[],
    languageList?: LocaleCode[]
): LocaleOption[] => {
    return supportedLocales
        .filter((locale) => languageList?.includes(locale.code))
        .map((locale) => ({
            label: <FlagLanguageItem code={locale.code} name={locale.name} />,
            text: locale.name,
            value: locale.code,
        }))
}
