import { act, renderHook } from '@repo/testing'

import { useDateFormatPreference } from './useDateFormatPreference'

const STORAGE_KEY = 'ai-journey-date-format-preference'

describe('useDateFormatPreference', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('defaults to absolute format when no preference is stored', () => {
        const { result } = renderHook(() => useDateFormatPreference())

        expect(result.current.format).toBe('absolute')
    })

    it('returns the stored preference', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify('relative'))

        const { result } = renderHook(() => useDateFormatPreference())

        expect(result.current.format).toBe('relative')
    })

    it('toggles from absolute to relative', () => {
        const { result } = renderHook(() => useDateFormatPreference())

        act(() => {
            result.current.toggleFormat()
        })

        expect(result.current.format).toBe('relative')
        expect(localStorage.getItem(STORAGE_KEY)).toBe(
            JSON.stringify('relative'),
        )
    })

    it('toggles from relative back to absolute', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify('relative'))
        const { result } = renderHook(() => useDateFormatPreference())

        act(() => {
            result.current.toggleFormat()
        })

        expect(result.current.format).toBe('absolute')
        expect(localStorage.getItem(STORAGE_KEY)).toBe(
            JSON.stringify('absolute'),
        )
    })
})
