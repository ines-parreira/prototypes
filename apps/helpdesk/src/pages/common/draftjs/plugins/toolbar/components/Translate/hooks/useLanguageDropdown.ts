import { useCallback, useMemo, useState } from 'react'

import { TranslationSupportedLanguagesInEnglish } from 'constants/languages'
import useAppSelector from 'hooks/useAppSelector'
import { getTicket } from 'state/ticket/selectors'

export function useLanguageDropdown() {
    const ticket = useAppSelector(getTicket)

    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const openDropdown = useCallback(() => {
        setIsOpen(true)
    }, [])

    const closeDropdown = useCallback(() => {
        setIsOpen(false)
        setSearchTerm('')
    }, [])

    const toggleDropdown = useCallback(() => {
        setIsOpen((prev) => !prev)
    }, [])

    const detectedLanguage = useMemo(
        () =>
            TranslationSupportedLanguagesInEnglish.find(
                ({ code }) => code === ticket?.language,
            ),
        [ticket],
    )

    const filteredLanguages = useMemo(() => {
        const optionsWithoutDetectedLanguage =
            TranslationSupportedLanguagesInEnglish.filter(
                ({ code }) => code !== detectedLanguage?.code,
            )

        if (!searchTerm.trim()) {
            return optionsWithoutDetectedLanguage
        }

        const searchLower = searchTerm.toLowerCase()
        return optionsWithoutDetectedLanguage.filter(({ name }) =>
            name.toLowerCase().includes(searchLower),
        )
    }, [searchTerm, detectedLanguage])

    return {
        isOpen,
        searchTerm,
        detectedLanguage,
        filteredLanguages,
        openDropdown,
        closeDropdown,
        toggleDropdown,
        setSearchTerm,
    }
}
