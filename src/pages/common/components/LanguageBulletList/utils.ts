import {HelpCenterLocale} from '../../../../models/helpCenter/types'

// TODO: create ENUM from FLAGS somewhere in a shared folder
const FLAGS: {[key: string]: string} = {
    'en-us': '🇺🇸',
    'fr-fr': '🇫🇷',
    'fr-ca': '🇨🇦',
    'cs-cz': '🇨🇿',
    'da-dk': '🇩🇰',
    'nl-nl': '🇳🇱',
    'de-de': '🇩🇪',
    'it-it': '🇮🇹',
    'no-no': '🇳🇴',
    'es-es': '🇪🇸',
    'sv-se': '🇸🇪',
}

export function getEmojiFlag(code: string): string {
    return FLAGS[code.toLowerCase()] || ''
}

export function moveLocaleToFront(
    list: HelpCenterLocale[],
    defaultLocale: HelpCenterLocale
): HelpCenterLocale[] {
    return [
        defaultLocale,
        ...list.filter((locale) => locale.code !== defaultLocale.code),
    ]
}

export function moveLocaleToBack(
    list: HelpCenterLocale[],
    defaultLocale: HelpCenterLocale
): HelpCenterLocale[] {
    return [
        ...list.filter((locale) => locale.code !== defaultLocale.code),
        defaultLocale,
    ]
}
