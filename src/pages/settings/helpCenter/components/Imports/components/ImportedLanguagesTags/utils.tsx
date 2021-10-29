import React from 'react'

import {Locale} from '../../../../../../../models/helpCenter/types'

import {FlagLanguageItem} from '../../../../../../common/components/LanguageBulletList'
import {BadgeItemProps} from '../../../HelpCenterPreferencesView/components/BadgeList'

export const localeToSelectedLanguage = (
    locale: Locale,
    isRemovable: boolean
): BadgeItemProps => ({
    id: locale.code,
    label: <FlagLanguageItem code={locale.code} name={locale.name} />,
    isClosable: isRemovable,
})
