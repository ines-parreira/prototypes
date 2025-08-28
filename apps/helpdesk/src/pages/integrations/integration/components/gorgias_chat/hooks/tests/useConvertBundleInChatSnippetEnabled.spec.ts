import { FeatureFlagKey } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import { useFlag } from 'core/flags'

import { useConvertBundleInChatSnippetEnabled } from '../useConvertBundleInChatSnippetEnabled'

jest.mock('core/flags')

describe('useConvertBundleInChatSnippetEnabled', () => {
    it('should return the value of the ConvertChatInstallSnippet feature flag', () => {
        ;(useFlag as jest.Mock).mockReturnValue(true)

        const { result } = renderHook(() =>
            useConvertBundleInChatSnippetEnabled(),
        )

        expect(result.current).toBe(true)
        expect(useFlag).toHaveBeenCalledWith(
            FeatureFlagKey.ConvertChatInstallSnippet,
        )
    })
})
