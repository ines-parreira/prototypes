import React from 'react'

import {Locale} from '../../../../../../../models/helpCenter/types'
import {FlagLanguageItem} from '../../../../../../common/components/LanguageBulletList'
import {BadgeItemProps} from '../BadgeList'

export function transformToSelectedLocale(
    locale: Locale,
    isRemovable: boolean
): BadgeItemProps {
    return {
        id: locale.code,
        label: <FlagLanguageItem code={locale.code} name={locale.name} />,
        help:
            !isRemovable &&
            'Change your default language to select a different language here.',
        isClosable: isRemovable,
    }
}
