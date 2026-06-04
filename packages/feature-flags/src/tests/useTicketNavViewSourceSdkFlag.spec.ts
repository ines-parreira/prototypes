import { renderHook } from '@testing-library/react'

import { FeatureFlagKey } from '../featureFlagKey'
import {
    useTicketNavViewSourceSdkFlag,
    useTicketNavViewSourceSdkFlagWithLoading,
} from '../shared-flags/useTicketNavViewSourceSdkFlag'
import { useFlagWithLoading } from '../useFlagWithLoading'

vi.mock('../useFlagWithLoading', () => ({
    useFlagWithLoading: vi.fn(),
}))

describe('useTicketNavViewSourceSdkFlag', () => {
    it('reads the ticket nav SDK source flag with a false default', () => {
        vi.mocked(useFlagWithLoading).mockReturnValue({
            isLoading: false,
            value: true,
        })

        const { result } = renderHook(() => useTicketNavViewSourceSdkFlag())

        expect(result.current).toBe(true)
        expect(useFlagWithLoading).toHaveBeenCalledWith(
            FeatureFlagKey.TicketNavViewSourceSdk,
            false,
        )
    })

    it('returns false while the flag value is loading', () => {
        vi.mocked(useFlagWithLoading).mockReturnValue({
            isLoading: true,
            value: true,
        })

        const { result } = renderHook(() => useTicketNavViewSourceSdkFlag())

        expect(result.current).toBe(false)
    })

    it('can expose the flag loading state', () => {
        vi.mocked(useFlagWithLoading).mockReturnValue({
            isLoading: true,
            value: true,
        })

        const { result } = renderHook(() =>
            useTicketNavViewSourceSdkFlagWithLoading(),
        )

        expect(result.current).toEqual({
            isLoading: true,
            value: true,
        })
    })
})
