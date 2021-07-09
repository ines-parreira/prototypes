import React from 'react'

import {
    HelpCenter,
    HelpCenterPreferences,
    HelpCenterLocale,
} from '../../../../../models/helpCenter/types'

import {FlagLanguageItem} from '../../../../common/components/LanguageBulletList'

import {LocalesByKey} from '../../providers/SupportedLocales'

// TODO: this is common util and needs to be moved probably as selector
export function appendLocaleDataToHelpcenter(
    helpcenter: HelpCenter,
    locales: LocalesByKey
): HelpCenterPreferences {
    return {
        ...helpcenter,
        default_locale: locales[helpcenter.default_locale],
        supported_locales:
            helpcenter?.supported_locales?.map((code) => locales[code]) || [],
    }
}

export function transformToSelectOption(locale: HelpCenterLocale) {
    return {
        id: locale.code,
        label: <FlagLanguageItem code={locale.code} name={locale.name} />,
        value: locale.code,
        text: locale.name,
    }
}

export function transformToSelectedLocale(
    locale: HelpCenterLocale,
    selectedLocale: string
) {
    return {
        id: locale.code,
        label: <FlagLanguageItem code={locale.code} name={locale.name} />,
        help:
            locale.code === selectedLocale &&
            'Change your default language to select a different language here.',
        isClosable: locale.code !== selectedLocale,
    }
}
