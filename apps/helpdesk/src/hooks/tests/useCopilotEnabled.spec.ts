import { mockFeatureFlagsValues } from '@repo/feature-flags/testing'
import { renderHook } from '@repo/testing'

import { useCopilotEnabled } from '../useCopilotEnabled'

describe('useCopilotEnabled', () => {
    it('returns false when the EnableCopilotUi flag is not set', () => {
        const { result } = renderHook(() => useCopilotEnabled())

        expect(result.current).toBe(false)
    })

    it('returns true when the EnableCopilotUi flag is enabled', () => {
        mockFeatureFlagsValues({ 'linear-project_copilot-enabled': true })

        const { result } = renderHook(() => useCopilotEnabled())

        expect(result.current).toBe(true)
    })
})
