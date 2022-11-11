import React from 'react'

import {Locale} from '../../../../../../../models/helpCenter/types'
import {FlagLanguageItem} from '../../../../../../common/components/LanguageBulletList'
import {BadgeItemProps} from '../BadgeList'

export function transformToSelectedLocale(
    locale: Locale,
    labelForNonRemovable: string | null
): BadgeItemProps {
    return {
        id: locale.code,
        label: <FlagLanguageItem code={locale.code} name={locale.name} />,
        help: labelForNonRemovable,
        isClosable: !labelForNonRemovable,
    }
}
