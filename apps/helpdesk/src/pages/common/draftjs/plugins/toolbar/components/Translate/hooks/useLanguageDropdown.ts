import { useCallback, useMemo, useState } from 'react'

import { ISO639English } from 'constants/languages'

export function useLanguageDropdown() {
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

    const filteredLanguages = useMemo(() => {
        if (!searchTerm.trim()) {
            return Object.entries(ISO639English).map(([code, name]) => ({
                code,
                name,
            }))
        }

        const searchLower = searchTerm.toLowerCase()
        return Object.entries(ISO639English)
            .filter(([__, name]) => name.toLowerCase().includes(searchLower))
            .map(([code, name]) => ({
                code,
                name,
            }))
    }, [searchTerm])

    return {
        isOpen,
        searchTerm,
        filteredLanguages,
        openDropdown,
        closeDropdown,
        toggleDropdown,
        setSearchTerm,
    }
}
