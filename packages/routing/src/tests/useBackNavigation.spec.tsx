import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useBackNavigation } from '../hooks/useBackNavigation'
import { getPreviousUrl } from '../urlTracking'

vi.mock('../urlTracking', () => ({
    getPreviousUrl: vi.fn(),
}))

const mockedGetPreviousUrl = vi.mocked(getPreviousUrl)

describe('useBackNavigation', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('resolves to the previous in-app page, preserving its query string', () => {
        mockedGetPreviousUrl.mockReturnValue(
            `${window.location.origin}/app/settings/users?page=2`,
        )

        const { result } = renderHook(() => useBackNavigation('/home'))

        expect(result.current).toBe('/app/settings/users?page=2')
    })

    it('resolves to the fallback when there is no previous page', () => {
        mockedGetPreviousUrl.mockReturnValue(null)

        const { result } = renderHook(() => useBackNavigation('/home'))

        expect(result.current).toBe('/home')
    })

    it('resolves to the fallback when the previous page is external', () => {
        mockedGetPreviousUrl.mockReturnValue('https://example.com/whatever')

        const { result } = renderHook(() => useBackNavigation('/home'))

        expect(result.current).toBe('/home')
    })

    it('defaults the fallback to the home page', () => {
        mockedGetPreviousUrl.mockReturnValue(null)

        const { result } = renderHook(() => useBackNavigation())

        expect(result.current).toBe('/')
    })
})
