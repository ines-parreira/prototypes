import { useTreatmentWithConfig } from '@splitsoftware/splitio-react'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FeatureFlagKey } from '../featureFlagKey'
import { useFlagWithLoading } from '../useFlagWithLoading'

vi.mock('@splitsoftware/splitio-react', () => ({
    useTreatmentWithConfig: vi.fn(),
}))

const useTreatmentWithConfigMock = vi.mocked(useTreatmentWithConfig)

const testFlag = 'test-flag' as FeatureFlagKey

type SplitMockState = {
    treatment: string
    config?: string | null
    isReady?: boolean
    isReadyFromCache?: boolean
    hasTimedout?: boolean
}

function mockHook(state: SplitMockState) {
    useTreatmentWithConfigMock.mockReturnValue({
        treatment: {
            treatment: state.treatment,
            config: state.config ?? null,
        },
        isReady: state.isReady ?? false,
        isReadyFromCache: state.isReadyFromCache ?? false,
        hasTimedout: state.hasTimedout ?? false,
        isTimedout: false,
        lastUpdate: 0,
        isDestroyed: false,
        factory: undefined,
        client: undefined,
    } as ReturnType<typeof useTreatmentWithConfig>)
}

describe('useFlagWithLoading', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockHook({ treatment: 'control' })
    })

    it('returns isLoading: true before the SDK is ready', () => {
        mockHook({ treatment: 'control' })

        const { result } = renderHook(() => useFlagWithLoading(testFlag))

        expect(result.current.isLoading).toBe(true)
    })

    it('returns the default value while loading', () => {
        mockHook({ treatment: 'control' })

        const { result } = renderHook(() => useFlagWithLoading(testFlag, true))

        expect(result.current.value).toBe(true)
    })

    it('returns isLoading: false once the SDK is ready', () => {
        mockHook({ treatment: 'on', isReady: true })

        const { result } = renderHook(() => useFlagWithLoading(testFlag))

        expect(result.current.isLoading).toBe(false)
    })

    it('returns isLoading: false when the SDK is ready from cache', () => {
        mockHook({ treatment: 'on', isReadyFromCache: true })

        const { result } = renderHook(() => useFlagWithLoading(testFlag))

        expect(result.current.isLoading).toBe(false)
    })

    it('returns isLoading: false when the SDK times out', () => {
        mockHook({ treatment: 'control', hasTimedout: true })

        const { result } = renderHook(() => useFlagWithLoading(testFlag))

        expect(result.current.isLoading).toBe(false)
    })

    it('returns the treatment value once ready', () => {
        mockHook({ treatment: 'on', isReady: true })

        const { result } = renderHook(() => useFlagWithLoading(testFlag))

        expect(result.current.value).toBe(true)
    })
})
