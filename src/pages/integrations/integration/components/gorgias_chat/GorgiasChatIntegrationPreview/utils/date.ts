import 'moment/locale/fr'
import 'moment/locale/es'
import 'moment/locale/da'
import 'moment/locale/sv'
import 'moment/locale/nl'
import 'moment/locale/it'
import 'moment/locale/de'
import 'moment/locale/nb'
import 'moment/locale/cs'
import 'moment/locale/ja'
import 'moment/locale/pt'
import 'moment/locale/fi'

/**
 * Same logic as in the chat client.
 * https://github.com/gorgias/gorgias-chat/blob/6c981f0333597d5e56a9704d5353d3996d755bc1/packages/client/src/utils/date.ts
 */

export const languageToLocale = (language: string): string => {
    const locale = language.split('-')[0]

    switch (locale) {
        case 'no':
            return 'nb'
        case 'cz':
            return 'cs'
        default:
            return locale
    }
}
