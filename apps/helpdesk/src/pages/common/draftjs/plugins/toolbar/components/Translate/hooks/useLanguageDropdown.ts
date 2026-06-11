import { useCallback, useMemo, useState } from 'react'

import { getTranslationLanguageOptionsData } from '@repo/utils'

import { useAppSelector } from 'hooks/useAppSelector'
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

    const { detectedLanguage, filteredLanguages } = useMemo(
        () => getTranslationLanguageOptionsData(ticket?.language, searchTerm),
        [ticket?.language, searchTerm],
    )

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
