import {LocaleCode} from 'models/helpCenter/types'
import {LanguageTimeFormat} from '../constants/languages'

export const localeTimeFormatConfigs: Record<LocaleCode, LanguageTimeFormat> = {
    'en-US': LanguageTimeFormat.twelveHours,
    'en-GB': LanguageTimeFormat.twentyFourHours,
    'fr-FR': LanguageTimeFormat.twentyFourHours,
    'fr-CA': LanguageTimeFormat.twelveHours,
    'es-ES': LanguageTimeFormat.twentyFourHours,
    'de-DE': LanguageTimeFormat.twentyFourHours,
    'nl-NL': LanguageTimeFormat.twentyFourHours,
    'cs-CZ': LanguageTimeFormat.twentyFourHours,
    'da-DK': LanguageTimeFormat.twentyFourHours,
    'no-NO': LanguageTimeFormat.twentyFourHours,
    'it-IT': LanguageTimeFormat.twentyFourHours,
    'sv-SE': LanguageTimeFormat.twentyFourHours,
    'fi-FI': LanguageTimeFormat.twentyFourHours,
    'ja-JP': LanguageTimeFormat.twentyFourHours,
    'pt-BR': LanguageTimeFormat.twentyFourHours,
}
