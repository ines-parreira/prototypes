import { renderHook } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { useSearchParams } from '../hooks/useSearchParams'

function createWrapper(initialPath = '/') {
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <MemoryRouter initialEntries={[initialPath]}>
                <Switch>
                    <Route path="*">{children}</Route>
                </Switch>
            </MemoryRouter>
        )
    }
}

describe('useSearchParams', () => {
    it('should return empty URLSearchParams when no search params exist', () => {
        const { result } = renderHook(() => useSearchParams(), {
            wrapper: createWrapper('/'),
        })

        const [searchParams] = result.current
        expect(searchParams.toString()).toBe('')
        expect(searchParams.get('test')).toBeNull()
    })

    it('should return search param value when it exists', () => {
        const { result } = renderHook(() => useSearchParams(), {
            wrapper: createWrapper('/?test=value'),
        })

        const [searchParams] = result.current
        expect(searchParams.get('test')).toBe('value')
    })

    it('should set search params using object', () => {
        const { result } = renderHook(() => useSearchParams(), {
            wrapper: createWrapper('/'),
        })

        act(() => {
            result.current[1]({ test: 'newValue' })
        })

        expect(result.current[0].get('test')).toBe('newValue')
    })

    it('should update existing search param value', () => {
        const { result } = renderHook(() => useSearchParams(), {
            wrapper: createWrapper('/?test=oldValue'),
        })

        expect(result.current[0].get('test')).toBe('oldValue')

        act(() => {
            result.current[1]({ test: 'newValue' })
        })

        expect(result.current[0].get('test')).toBe('newValue')
    })

    it('should remove search param when not included in object', () => {
        const { result } = renderHook(() => useSearchParams(), {
            wrapper: createWrapper('/?test=value&other=data'),
        })

        expect(result.current[0].get('test')).toBe('value')

        act(() => {
            result.current[1]({ other: 'data' })
        })

        expect(result.current[0].get('test')).toBeNull()
        expect(result.current[0].get('other')).toBe('data')
    })

    it('should support function callback with prev parameter for updates', () => {
        const { result } = renderHook(() => useSearchParams(), {
            wrapper: createWrapper('/?count=5'),
        })

        act(() => {
            result.current[1](({ prev }) => {
                const count = parseInt(prev.get('count') || '0', 10)
                return { count: String(count + 1) }
            })
        })

        expect(result.current[0].get('count')).toBe('6')
    })

    it('should support function callback with draft parameter for updates', () => {
        const { result } = renderHook(() => useSearchParams(), {
            wrapper: createWrapper('/?existing=value&count=5'),
        })

        act(() => {
            result.current[1](({ draft }) => ({
                ...draft,
                count: String(parseInt(draft.count as string, 10) + 1),
            }))
        })

        expect(result.current[0].get('count')).toBe('6')
        expect(result.current[0].get('existing')).toBe('value')
    })

    it('should support multiple values for a key', () => {
        const { result } = renderHook(() => useSearchParams(), {
            wrapper: createWrapper('/'),
        })

        act(() => {
            result.current[1]({ brand: ['nike', 'reebok'] })
        })

        expect(result.current[0].getAll('brand')).toEqual(['nike', 'reebok'])
    })

    it('should accept string initialization format', () => {
        const { result } = renderHook(() => useSearchParams(), {
            wrapper: createWrapper('/'),
        })

        act(() => {
            result.current[1]('test=value&other=data')
        })

        expect(result.current[0].get('test')).toBe('value')
        expect(result.current[0].get('other')).toBe('data')
    })

    it('should accept URLSearchParams initialization format', () => {
        const { result } = renderHook(() => useSearchParams(), {
            wrapper: createWrapper('/'),
        })

        const params = new URLSearchParams()
        params.set('test', 'value')
        params.set('other', 'data')

        act(() => {
            result.current[1](params)
        })

        expect(result.current[0].get('test')).toBe('value')
        expect(result.current[0].get('other')).toBe('data')
    })

    it('should accept array of tuples initialization format', () => {
        const { result } = renderHook(() => useSearchParams(), {
            wrapper: createWrapper('/'),
        })

        act(() => {
            result.current[1]([
                ['test', 'value'],
                ['other', 'data'],
            ])
        })

        expect(result.current[0].get('test')).toBe('value')
        expect(result.current[0].get('other')).toBe('data')
    })

    it('should support defaultInit parameter', () => {
        const { result } = renderHook(
            () => useSearchParams({ test: 'default' }),
            {
                wrapper: createWrapper('/'),
            },
        )

        expect(result.current[0].get('test')).toBe('default')
    })

    it('should not apply defaultInit if URL already has search params', () => {
        const { result } = renderHook(
            () => useSearchParams({ test: 'default' }),
            {
                wrapper: createWrapper('/?test=existing'),
            },
        )

        expect(result.current[0].get('test')).toBe('existing')
    })
})
