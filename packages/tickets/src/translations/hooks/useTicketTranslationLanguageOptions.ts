import { useCallback, useMemo, useState } from 'react'

import type { TranslationLanguageOption } from '@repo/utils'
import { getTranslationLanguageOptionsData } from '@repo/utils'

import type { Language } from '@gorgias/helpdesk-types'

export type TranslationLanguageSection = {
    id: string
    items: TranslationLanguageOption[]
    name: string
}

export function useTicketTranslationLanguageOptions(
    ticketLanguage?: Language | null,
) {
    const [searchTerm, setSearchTerm] = useState('')

    const { detectedLanguage, filteredLanguages } = useMemo(
        () => getTranslationLanguageOptionsData(ticketLanguage, searchTerm),
        [ticketLanguage, searchTerm],
    )

    const sections = useMemo(() => {
        const nextSections: TranslationLanguageSection[] = []

        if (detectedLanguage) {
            nextSections.push({
                id: 'detected-language',
                name: 'Detected language',
                items: [detectedLanguage],
            })
        }

        if (filteredLanguages.length > 0) {
            nextSections.push({
                id: 'all-languages',
                name: 'All languages (A->Z)',
                items: filteredLanguages,
            })
        }

        return nextSections
    }, [detectedLanguage, filteredLanguages])

    const resetSearch = useCallback(() => {
        setSearchTerm('')
    }, [])

    return {
        detectedLanguage,
        filteredLanguages,
        resetSearch,
        searchTerm,
        sections,
        setSearchTerm,
    }
}
