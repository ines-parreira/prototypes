import React from 'react'

import {HelpCenterLocale} from '../../../../../models/helpCenter/types'

import {FlagLanguageItem} from '../../../../common/components/LanguageBulletList'

export function generateLocaleOptions(
    supportedLocales: HelpCenterLocale[],
    languageList: string[]
) {
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
