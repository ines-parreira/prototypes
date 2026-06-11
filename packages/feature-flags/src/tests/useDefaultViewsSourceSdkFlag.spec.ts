import { renderHook } from '@testing-library/react'

import { FeatureFlagKey } from '../featureFlagKey'
import {
    useDefaultViewsSourceSdkFlag,
    useDefaultViewsSourceSdkFlagWithLoading,
} from '../shared-flags/useDefaultViewsSourceSdkFlag'
import { useFlagWithLoading } from '../useFlagWithLoading'

vi.mock('../useFlagWithLoading', () => ({
    useFlagWithLoading: vi.fn(),
}))

describe('useDefaultViewsSourceSdkFlag', () => {
    it('reads the default views SDK source flag with a false default', () => {
        vi.mocked(useFlagWithLoading).mockReturnValue({
            isLoading: false,
            value: true,
        })

        const { result } = renderHook(() => useDefaultViewsSourceSdkFlag())

        expect(result.current).toBe(true)
        expect(useFlagWithLoading).toHaveBeenCalledWith(
            FeatureFlagKey.DefaultViewsSourceSdk,
            false,
        )
    })

    it('returns false while the flag value is loading', () => {
        vi.mocked(useFlagWithLoading).mockReturnValue({
            isLoading: true,
            value: true,
        })

        const { result } = renderHook(() => useDefaultViewsSourceSdkFlag())

        expect(result.current).toBe(false)
    })

    it('can expose the flag loading state', () => {
        vi.mocked(useFlagWithLoading).mockReturnValue({
            isLoading: true,
            value: true,
        })

        const { result } = renderHook(() =>
            useDefaultViewsSourceSdkFlagWithLoading(),
        )

        expect(result.current).toEqual({
            isLoading: true,
            value: true,
        })
    })
})
