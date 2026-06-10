import { FeatureFlagKey } from '@repo/feature-flags'
import { mockFeatureFlagsValues } from '@repo/feature-flags/testing'
import { renderHook } from '@repo/testing'

import { useChatRedesignCutoffDate } from './useChatRedesignCutoffDate'

describe('useChatRedesignCutoffDate', () => {
    it('returns the default August 1st when the flag is not set', () => {
        const { result } = renderHook(() => useChatRedesignCutoffDate())

        expect(result.current).toBe('August 1st')
    })

    it('formats the cut_off_date from the flag', () => {
        mockFeatureFlagsValues({
            [FeatureFlagKey.NonAiAgentChatRevampCutoffDate]: {
                cut_off_date: '2026-08-15',
            },
        })

        const { result } = renderHook(() => useChatRedesignCutoffDate())

        expect(result.current).toBe('August 15th')
    })

    it('formats any configured cut_off_date', () => {
        mockFeatureFlagsValues({
            [FeatureFlagKey.NonAiAgentChatRevampCutoffDate]: {
                cut_off_date: '2026-08-03',
            },
        })

        const { result } = renderHook(() => useChatRedesignCutoffDate())

        expect(result.current).toBe('August 3rd')
    })
})
