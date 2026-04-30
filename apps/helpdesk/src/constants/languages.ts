import {
    IntlDisplayNames,
    TranslationSupportedLanguagesInEnglish,
} from '@repo/utils'

export { IntlDisplayNames, TranslationSupportedLanguagesInEnglish }

export enum LANGUAGE {
    CZ = 'cz',
    DA = 'da',
    NL = 'nl',
    EN_GB = 'en-GB',
    EN_US = 'en-US',
    FI = 'fi',
    FR = 'fr',
    FR_CA = 'fr-CA',
    FR_FR = 'fr-FR',
    DE = 'de',
    IT = 'it',
    JA = 'ja',
    NO = 'no',
    PT_BR = 'pt-BR',
    ES = 'es',
    SV = 'sv',
}

export enum LOCALE {
    ENGLISH_USA = 'en-US',
    ENGLISH_GB = 'en-GB',
    FRENCH_FRANCE = 'fr-FR',
    FRENCH_CANADA = 'fr-CA',
    SPANISH_SPAIN = 'es-ES',
    GERMAN = 'de-DE',
    DUTCH = 'nl-NL',
    CZECH = 'cs-CZ',
    DANISH = 'da-DK',
    NORWEGIAN = 'no-NO',
    ITALIAN = 'it-IT',
    SWEDISH = 'sv-SE',
    PORTUGUESE_BRAZIL = 'pt-BR',
    FINNISH = 'fi-FI',
    JAPANESE = 'ja-JP',
}

export const LOCALE_TO_LANGUAGE_MAPPING: {
    [key: string]: LANGUAGE
} = {
    [LOCALE.ENGLISH_USA]: LANGUAGE.EN_US,
    [LOCALE.ENGLISH_GB]: LANGUAGE.EN_GB,
    [LOCALE.FRENCH_FRANCE]: LANGUAGE.FR_FR,
    [LOCALE.FRENCH_CANADA]: LANGUAGE.FR_CA,
    [LOCALE.SPANISH_SPAIN]: LANGUAGE.ES,
    [LOCALE.GERMAN]: LANGUAGE.DE,
    [LOCALE.DUTCH]: LANGUAGE.NL,
    [LOCALE.CZECH]: LANGUAGE.CZ,
    [LOCALE.DANISH]: LANGUAGE.DA,
    [LOCALE.NORWEGIAN]: LANGUAGE.NO,
    [LOCALE.ITALIAN]: LANGUAGE.IT,
    [LOCALE.SWEDISH]: LANGUAGE.SV,
    [LOCALE.FINNISH]: LANGUAGE.FI,
    [LOCALE.JAPANESE]: LANGUAGE.JA,
    [LOCALE.PORTUGUESE_BRAZIL]: LANGUAGE.PT_BR,
}

export const LANGUAGE_TO_LOCALE_MAPPING: {
    [key: string]: LOCALE
} = {
    [LANGUAGE.EN_US]: LOCALE.ENGLISH_USA,
    [LANGUAGE.EN_GB]: LOCALE.ENGLISH_GB,
    [LANGUAGE.FR_FR]: LOCALE.FRENCH_FRANCE,
    [LANGUAGE.FR_CA]: LOCALE.FRENCH_CANADA,
    [LANGUAGE.ES]: LOCALE.SPANISH_SPAIN,
    [LANGUAGE.DE]: LOCALE.GERMAN,
    [LANGUAGE.NL]: LOCALE.DUTCH,
    [LANGUAGE.CZ]: LOCALE.CZECH,
    [LANGUAGE.DA]: LOCALE.DANISH,
    [LANGUAGE.NO]: LOCALE.NORWEGIAN,
    [LANGUAGE.IT]: LOCALE.ITALIAN,
    [LANGUAGE.SV]: LOCALE.SWEDISH,
    [LANGUAGE.FI]: LOCALE.FINNISH,
    [LANGUAGE.JA]: LOCALE.JAPANESE,
    [LANGUAGE.PT_BR]: LOCALE.PORTUGUESE_BRAZIL,
}

/**
 * Chat widget does not use `French = 'fr'`
 */
export enum LanguageChat {
    Czech = 'cz',
    Danish = 'da',
    Dutch = 'nl',
    EnglishGb = 'en-GB',
    EnglishUs = 'en-US',
    Finnish = 'fi',
    FrenchCa = 'fr-CA',
    FrenchFr = 'fr-FR',
    German = 'de',
    Italian = 'it',
    Japanese = 'ja',
    Norwegian = 'no',
    PortugueseBrazil = 'pt-BR',
    Spanish = 'es',
    Swedish = 'sv',
}

export enum LanguageTimeFormat {
    twelveHours,
    twentyFourHours,
}

// ISO 639-1 language codes (same as backend)
export const ISO639 = [
    'af',
    'ar',
    'bg',
    'bn',
    'ca',
    'cs',
    'cy',
    'da',
    'de',
    'el',
    'en',
    'es',
    'et',
    'fa',
    'fi',
    'fr',
    'gu',
    'he',
    'hi',
    'hr',
    'hu',
    'id',
    'it',
    'ja',
    'kn',
    'ko',
    'lt',
    'lv',
    'mk',
    'ml',
    'mr',
    'ms',
    'ne',
    'nl',
    'no',
    'pa',
    'pl',
    'pt',
    'ro',
    'ru',
    'sk',
    'sl',
    'so',
    'sq',
    'sv',
    'sw',
    'ta',
    'te',
    'th',
    'tl',
    'tr',
    'uk',
    'ur',
    'vi',
    'zh-cn',
    'zh-tw',
    'zh',
]

export const ISO639English = ISO639.reduce((pair: string[][], code) => {
    pair.push([code, IntlDisplayNames.of(code) as string])
    return pair
}, [])
    .sort(([, a], [, b]) => a.localeCompare(b))
    .reduce((obj: { [code: string]: string }, pair) => {
        obj[pair[0]] = pair[1]
        return obj
    }, {})
