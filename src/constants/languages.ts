export enum Language {
    EnglishUs = 'en-US',
    French = 'fr',
    FrenchCa = 'fr-CA',
    FrenchFr = 'fr-FR',
    Spanish = 'es',
    Danish = 'da',
    Swedish = 'sv',
    Dutch = 'nl',
    Italian = 'it',
    German = 'de',
    Norwegian = 'no',
    Czech = 'cz',
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

const IntlDisplayNames = new Intl.DisplayNames(['en'], {type: 'language'})

export const ISO639English = ISO639.reduce((pair: string[][], code) => {
    pair.push([code, IntlDisplayNames.of(code)])
    return pair
}, [])
    .sort(([, a], [, b]) => a.localeCompare(b))
    .reduce((obj: {[code: string]: string}, pair) => {
        obj[pair[0]] = pair[1]
        return obj
    }, {})
