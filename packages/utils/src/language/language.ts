import { TicketLanguage } from '@gorgias/helpdesk-types'

export type TranslationLanguageOption = {
    code: string
    name: string
}

export type TranslationLanguageOptionsData = {
    detectedLanguage?: TranslationLanguageOption
    filteredLanguages: TranslationLanguageOption[]
}

export const IntlDisplayNames = new Intl.DisplayNames(['en'], {
    type: 'language',
})

const translationSupportedRecord = Object.values(TicketLanguage)
    .filter((code) => !code.includes('-'))
    .reduce<Record<string, string>>((record, code) => {
        const label = IntlDisplayNames.of(code) as string

        if (code === label) {
            return record
        }

        record[label] = code

        return record
    }, {})

export const TranslationSupportedLanguagesInEnglish = Object.entries(
    translationSupportedRecord,
)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, code]) => ({
        code,
        name,
    })) as TranslationLanguageOption[]

export function getTranslationLanguageOptionsData(
    ticketLanguage?: string | null,
    searchTerm = '',
): TranslationLanguageOptionsData {
    const detectedLanguage = TranslationSupportedLanguagesInEnglish.find(
        ({ code }) => code === ticketLanguage,
    )

    const optionsWithoutDetectedLanguage =
        TranslationSupportedLanguagesInEnglish.filter(
            ({ code }) => code !== detectedLanguage?.code,
        )

    if (!searchTerm.trim()) {
        return {
            detectedLanguage,
            filteredLanguages: optionsWithoutDetectedLanguage,
        }
    }

    const searchLower = searchTerm.toLowerCase()

    return {
        detectedLanguage,
        filteredLanguages: optionsWithoutDetectedLanguage.filter(({ name }) =>
            name.toLowerCase().includes(searchLower),
        ),
    }
}
