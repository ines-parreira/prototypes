import type { Map } from 'immutable'

import { GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS } from 'config/integrations/gorgias_chat'
import { LanguageChat } from 'constants/languages'
import type {
    TextsMultiLanguage,
    TextsPerLanguage,
} from 'rest_api/gorgias_chat_protected_api/types'

export const emptyTextsPerLanguage: TextsPerLanguage = {
    texts: {},
    sspTexts: {},
    meta: {},
}

export const multiLanguageInitialTextsEmptyData: TextsMultiLanguage =
    Object.values(LanguageChat).reduce(
        (acc, lang) => ({
            ...acc,
            [lang]: {
                texts: {},
                sspTexts: {},
                meta: {},
            } as TextsPerLanguage,
        }),
        {} as TextsMultiLanguage,
    )

export function getSelectedLanguage(
    languageValue: LanguageChat,
): Map<string, string> | null {
    if (Object.values(LanguageChat).includes(languageValue)) {
        return GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.find((el) => {
            return el?.get('value') === languageValue
        })
    }

    return null
}
