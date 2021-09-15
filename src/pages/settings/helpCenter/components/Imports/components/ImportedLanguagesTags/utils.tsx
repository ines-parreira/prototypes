import React from 'react'

import {HelpCenterLocale} from '../../../../../../../models/helpCenter/types'

import {FlagLanguageItem} from '../../../../../../common/components/LanguageBulletList'
import {
    BadgeItemProps,
    BadgeSelectItem,
} from '../../../HelpCenterPreferencesView/components/BadgeList'

export const localeToLanguageSelectOption = (
    locale: HelpCenterLocale
): BadgeSelectItem => {
    return {
        id: locale.code,
        label: <FlagLanguageItem code={locale.code} name={locale.name} />,
        value: locale.code,
        text: locale.name,
    }
}

export const localeToSelectedLanguage = (
    locale: HelpCenterLocale,
    isRemovable: boolean
): BadgeItemProps => ({
    id: locale.code,
    label: <FlagLanguageItem code={locale.code} name={locale.name} />,
    isClosable: isRemovable,
})
