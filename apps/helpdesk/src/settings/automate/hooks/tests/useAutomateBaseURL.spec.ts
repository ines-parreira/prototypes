import { renderHook } from '@repo/testing'

import { useAutomateBaseURL } from '../useAutomateBaseURL'

describe('useAutomateBaseURL', () => {
    it('should return /app/settings when in settings', () => {
        const { result } = renderHook(() => useAutomateBaseURL(), {
            initialEntries: ['/app/settings'],
        })
        expect(result.current).toBe('/app/settings')
    })

    it('should return /app/automation when not in automate settings', () => {
        const { result } = renderHook(() => useAutomateBaseURL(), {
            initialEntries: ['/app/automation'],
        })
        expect(result.current).toBe('/app/automation')
    })
})
