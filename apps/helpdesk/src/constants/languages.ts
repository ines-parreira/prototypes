import { TicketLanguage } from '@gorgias/helpdesk-types'

export enum Language {
    Czech = 'cz',
    Danish = 'da',
    Dutch = 'nl',
    EnglishGb = 'en-GB',
    EnglishUs = 'en-US',
    Finnish = 'fi',
    French = 'fr',
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

const IntlDisplayNames = new Intl.DisplayNames(['en'], { type: 'language' })

export const ISO639English = ISO639.reduce((pair: string[][], code) => {
    pair.push([code, IntlDisplayNames.of(code) as string])
    return pair
}, [])
    .sort(([, a], [, b]) => a.localeCompare(b))
    .reduce((obj: { [code: string]: string }, pair) => {
        obj[pair[0]] = pair[1]
        return obj
    }, {})

const TranslationSupportedRecord = Object.values(TicketLanguage)
    .filter((code) => !code.includes('-'))
    .reduce<Record<string, string>>((record, code) => {
        const label = IntlDisplayNames.of(code) as string
        // If the code and the last label are identical, theirs not support by the
        // browser IntlDisplayNames, so we don't need to add it to the list
        if (code === label) {
            return record
        }

        // Prevent duplicates (Akan for example)
        record[IntlDisplayNames.of(code) as string] = code

        return record
    }, {})

export const TranslationSupportedLanguagesInEnglish = Object.entries(
    TranslationSupportedRecord,
)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, code]) => ({
        code,
        name,
    }))
