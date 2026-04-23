import { useTreatmentWithConfig } from '@splitsoftware/splitio-react'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FeatureFlagKey } from '../featureFlagKey'
import { useFlag } from '../useFlag'

vi.mock('@splitsoftware/splitio-react', () => ({
    useTreatmentWithConfig: vi.fn(),
}))

const useTreatmentWithConfigMock = vi.mocked(useTreatmentWithConfig)

const testFlag = 'test-flag' as FeatureFlagKey

function mockTreatment(treatment: string, config: string | null = null) {
    useTreatmentWithConfigMock.mockReturnValue({
        treatment: { treatment, config },
        isReady: true,
        isReadyFromCache: true,
        hasTimedout: false,
        isTimedout: false,
        lastUpdate: 0,
        isDestroyed: false,
        factory: undefined,
        client: undefined,
    } as ReturnType<typeof useTreatmentWithConfig>)
}

describe('useFlag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockTreatment('control')
    })

    it('returns true when the treatment is on', () => {
        mockTreatment('on')

        const { result } = renderHook(() => useFlag(testFlag))

        expect(result.current).toBe(true)
    })

    it('returns false when the treatment is off', () => {
        mockTreatment('off')

        const { result } = renderHook(() => useFlag(testFlag))

        expect(result.current).toBe(false)
    })

    it('returns the default value when the treatment is control', () => {
        mockTreatment('control')

        const { result } = renderHook(() => useFlag(testFlag, true))

        expect(result.current).toBe(true)
    })

    it('parses JSON config when provided', () => {
        mockTreatment('on', '{"foo":"bar"}')

        const { result } = renderHook(() =>
            useFlag<{ foo: string }>(testFlag, { foo: 'default' }),
        )

        expect(result.current).toEqual({ foo: 'bar' })
    })

    it('normalizes flag ids with dots before passing to Split', () => {
        mockTreatment('on')
        const dottedFlag = 'linear.project.feature' as FeatureFlagKey

        renderHook(() => useFlag(dottedFlag))

        expect(useTreatmentWithConfigMock).toHaveBeenCalledWith({
            name: 'linear-project-feature',
        })
    })

    it('returns a referentially stable JSON value across re-renders when the upstream config is unchanged', () => {
        mockTreatment('on', '{"foo":"bar"}')

        const { result, rerender } = renderHook(() =>
            useFlag<{ foo: string }>(testFlag, { foo: 'default' }),
        )

        const first = result.current
        rerender()
        const second = result.current

        expect(second).toBe(first)
    })

    it('returns a new reference when the upstream config changes', () => {
        mockTreatment('on', '{"foo":"bar"}')

        const { result, rerender } = renderHook(() =>
            useFlag<{ foo: string }>(testFlag, { foo: 'default' }),
        )

        const first = result.current

        mockTreatment('on', '{"foo":"baz"}')
        rerender()

        expect(result.current).not.toBe(first)
        expect(result.current).toEqual({ foo: 'baz' })
    })

    it('returns a stable defaultValue reference across re-renders while on control', () => {
        mockTreatment('control')

        const { result, rerender } = renderHook(() =>
            useFlag<{ foo: string }>(testFlag, { foo: 'default' }),
        )

        const first = result.current
        rerender()

        expect(result.current).toBe(first)
        expect(result.current).toEqual({ foo: 'default' })
    })
})
