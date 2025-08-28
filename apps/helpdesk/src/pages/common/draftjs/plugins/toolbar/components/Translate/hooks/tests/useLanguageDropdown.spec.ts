import { act, renderHook } from '@testing-library/react'

import { useLanguageDropdown } from '../useLanguageDropdown'

jest.mock('constants/languages', () => ({
    ISO639English: {
        en: 'English',
        fr: 'French',
        de: 'German',
        es: 'Spanish',
    },
}))

describe('useLanguageDropdown', () => {
    it('initializes with default values', () => {
        const { result } = renderHook(() => useLanguageDropdown())

        expect(result.current.isOpen).toBe(false)
        expect(result.current.searchTerm).toBe('')
        expect(result.current.filteredLanguages).toHaveLength(4)
        expect(result.current.openDropdown).toBeDefined()
        expect(result.current.closeDropdown).toBeDefined()
        expect(result.current.toggleDropdown).toBeDefined()
        expect(result.current.setSearchTerm).toBeDefined()
    })

    it('toggles dropdown open state', () => {
        const { result } = renderHook(() => useLanguageDropdown())

        act(() => {
            result.current.toggleDropdown()
        })

        expect(result.current.isOpen).toBe(true)

        act(() => {
            result.current.toggleDropdown()
        })

        expect(result.current.isOpen).toBe(false)
    })

    it('filters languages based on search term', () => {
        const { result } = renderHook(() => useLanguageDropdown())

        act(() => {
            result.current.setSearchTerm('fr')
        })

        expect(result.current.filteredLanguages).toEqual([
            { code: 'fr', name: 'French' },
        ])
    })

    it('resets search term when closing dropdown', () => {
        const { result } = renderHook(() => useLanguageDropdown())

        act(() => {
            result.current.setSearchTerm('test')
            result.current.openDropdown()
        })

        expect(result.current.searchTerm).toBe('test')

        act(() => {
            result.current.closeDropdown()
        })

        expect(result.current.searchTerm).toBe('')
        expect(result.current.isOpen).toBe(false)
    })
})
