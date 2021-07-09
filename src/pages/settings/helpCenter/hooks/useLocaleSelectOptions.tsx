import React from 'react'

import {HelpCenterLocale, LocaleCode} from '../../../../models/helpCenter/types'

import {FlagLanguageItem} from '../../../common/components/LanguageBulletList'

export type LocaleOption = {
    label: JSX.Element
    text: string
    value: string
}

export const useLocaleSelectOptions = (
    supportedLocales: HelpCenterLocale[],
    languageList: LocaleCode[]
): LocaleOption[] => {
    return supportedLocales
        .filter((locale) => {
            if (languageList?.length > 0) {
                return languageList.includes(locale.code)
            }
            return false
        })
        .map((locale) => ({
            label: <FlagLanguageItem code={locale.code} name={locale.name} />,
            text: locale.name,
            value: locale.code,
        }))
}
