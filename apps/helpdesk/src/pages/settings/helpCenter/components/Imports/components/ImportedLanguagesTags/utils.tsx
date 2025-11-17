import type { BadgeItemProps } from 'pages/common/components/BadgetItem'

import type { Locale } from '../../../../../../../models/helpCenter/types'
import { FlagLanguageItem } from '../../../../../../common/components/LanguageBulletList'

export const localeToSelectedLanguage = (
    locale: Locale,
    isRemovable: boolean,
): BadgeItemProps => ({
    id: locale.code,
    label: <FlagLanguageItem code={locale.code} name={locale.name} />,
    isClosable: isRemovable,
})
