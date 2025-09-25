import { act, renderHook } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'

import { useLanguageDropdown } from '../useLanguageDropdown'

jest.mock('constants/languages', () => ({
    ISO639English: {
        en: 'English',
        fr: 'French',
        de: 'German',
        es: 'Spanish',
    },
}))

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = useAppSelector as jest.Mock

jest.mock('state/ticket/selectors', () => ({
    getTicket: jest.fn(),
}))

describe('useLanguageDropdown', () => {
    beforeEach(() => {
        mockUseAppSelector.mockClear()
    })

    const setupMocks = (ticketLanguage?: string) => {
        const mockTicket = ticketLanguage ? { language: ticketLanguage } : null
        mockUseAppSelector.mockReturnValue(mockTicket)
    }

    it('initializes with default values', () => {
        setupMocks()
        const { result } = renderHook(() => useLanguageDropdown())

        expect(result.current.isOpen).toBe(false)
        expect(result.current.searchTerm).toBe('')
        expect(result.current.filteredLanguages).toHaveLength(4)
        expect(result.current.detectedLanguage).toBeUndefined()
        expect(result.current.openDropdown).toBeDefined()
        expect(result.current.closeDropdown).toBeDefined()
        expect(result.current.toggleDropdown).toBeDefined()
        expect(result.current.setSearchTerm).toBeDefined()
    })

    it('toggles dropdown open state', () => {
        setupMocks()
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
        setupMocks()
        const { result } = renderHook(() => useLanguageDropdown())

        act(() => {
            result.current.setSearchTerm('fr')
        })

        expect(result.current.filteredLanguages).toEqual([
            { code: 'fr', name: 'French' },
        ])
    })

    it('resets search term when closing dropdown', () => {
        setupMocks()
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

    it('detects language from ticket and excludes it from filtered languages', () => {
        setupMocks('fr')
        const { result } = renderHook(() => useLanguageDropdown())

        expect(result.current.detectedLanguage).toEqual({
            code: 'fr',
            name: 'French',
        })
        expect(result.current.filteredLanguages).toHaveLength(3)
        expect(
            result.current.filteredLanguages.find(
                (lang: { code: string; name: string }) => lang.code === 'fr',
            ),
        ).toBeUndefined()
    })

    it('includes all languages when no detected language', () => {
        setupMocks()
        const { result } = renderHook(() => useLanguageDropdown())

        expect(result.current.detectedLanguage).toBeUndefined()
        expect(result.current.filteredLanguages).toHaveLength(4)
    })

    it('filters languages excluding detected language', () => {
        setupMocks('en')
        const { result } = renderHook(() => useLanguageDropdown())

        expect(result.current.detectedLanguage).toEqual({
            code: 'en',
            name: 'English',
        })

        act(() => {
            result.current.setSearchTerm('fr')
        })

        expect(result.current.filteredLanguages).toEqual([
            { code: 'fr', name: 'French' },
        ])
        expect(
            result.current.filteredLanguages.find(
                (lang: { code: string; name: string }) => lang.code === 'en',
            ),
        ).toBeUndefined()
    })
})
