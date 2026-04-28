import { renderHook } from '@repo/testing'

import { useIsAutomateSettings } from '../useIsAutomateSettings'

describe('useIsAutomateSettings', () => {
    it('should return true when path starts with /app/settings/flows', () => {
        const { result } = renderHook(() => useIsAutomateSettings(), {
            initialEntries: ['/app/settings/flows'],
        })
        expect(result.current).toBe(true)
    })

    it('should return true when path has additional segments after /app/settings/automate', () => {
        const { result } = renderHook(() => useIsAutomateSettings(), {
            initialEntries: ['/app/settings/flows/shopify/my-shop'],
        })
        expect(result.current).toBe(true)
    })

    it('should return false when path does not start with /app/settings/automate', () => {
        const { result } = renderHook(() => useIsAutomateSettings(), {
            initialEntries: ['/app/automation'],
        })
        expect(result.current).toBe(false)
    })
})
