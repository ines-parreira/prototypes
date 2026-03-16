import { renderHook } from '@repo/testing'

import { useGenericTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend'

const makeHook = (value: number | null, prevValue: number | null) => ({
    data: value !== null ? { value, prevValue } : null,
    isFetching: false,
    isError: false,
})

const transformer = (data: { [key: string]: any }) => data.a + data.b

describe('useGenericTrend', () => {
    it('returns undefined when enabled is false', () => {
        const hooks = {
            a: makeHook(1, 2),
            b: makeHook(3, 4),
        }

        const { result } = renderHook(() =>
            useGenericTrend(hooks as any, transformer, false),
        )

        expect(result.current.data).toBeUndefined()
    })

    it('returns computed data when enabled is true (default)', () => {
        const hooks = {
            a: makeHook(1, 2),
            b: makeHook(3, 4),
        }

        const { result } = renderHook(() =>
            useGenericTrend(hooks as any, transformer),
        )

        expect(result.current.data).toEqual({ value: 4, prevValue: 6 })
    })

    it('returns undefined data when any hook has no data', () => {
        const hooks = {
            a: makeHook(null, null),
            b: makeHook(3, 4),
        }

        const { result } = renderHook(() =>
            useGenericTrend(hooks as any, transformer),
        )

        expect(result.current.data).toBeUndefined()
    })

    it('isFetching is true when enabled and any hook is fetching', () => {
        const hooks = {
            a: {
                data: { value: 1, prevValue: 2 },
                isFetching: true,
                isError: false,
            },
            b: makeHook(3, 4),
        }

        const { result } = renderHook(() =>
            useGenericTrend(hooks as any, transformer),
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('isFetching is false when disabled even if hook is fetching', () => {
        const hooks = {
            a: {
                data: { value: 1, prevValue: 2 },
                isFetching: true,
                isError: false,
            },
            b: makeHook(3, 4),
        }

        const { result } = renderHook(() =>
            useGenericTrend(hooks as any, transformer, false),
        )

        expect(result.current.isFetching).toBe(false)
    })

    it('isError is true when enabled and any hook has an error', () => {
        const hooks = {
            a: { data: null, isFetching: false, isError: true },
            b: makeHook(3, 4),
        }

        const { result } = renderHook(() =>
            useGenericTrend(hooks as any, transformer),
        )

        expect(result.current.isError).toBe(true)
    })
})
