import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import useLocalStorage from '../useLocalStorage'

describe('useLocalStorage', () => {
    afterEach(() => {
        localStorage.clear()
    })

    it('should retrieve an existing value from localStorage', () => {
        localStorage.setItem('foo', '"bar"')
        const { result } = renderHook(() => useLocalStorage('foo', 'default'))
        const [state] = result.current
        expect(state).toEqual('bar')
    })

    it('should return defaultValue if localStorage not set, and set that to localStorage', () => {
        const { result } = renderHook(() => useLocalStorage('foo', 'bar'))
        const [state] = result.current
        expect(state).toEqual('bar')
        expect(localStorage.getItem('foo')).toEqual('"bar"')
    })

    it('should prefer existing value over defaultValue', () => {
        localStorage.setItem('foo', '"bar"')
        const { result } = renderHook(() => useLocalStorage('foo', 'baz'))
        const [state] = result.current
        expect(state).toEqual('bar')
    })

    it('should prefer existing value over defaultValue even when value is "undefined"', () => {
        localStorage.setItem('foo', 'undefined')
        const { result } = renderHook(() => useLocalStorage('foo', 'baz'))
        const [state] = result.current
        expect(state).toEqual(undefined)
    })

    it('should not clobber existing localStorage with defaultValue', () => {
        localStorage.setItem('foo', '"bar"')
        const { result } = renderHook(() => useLocalStorage('foo', 'buzz'))
        expect(result.current).toBeTruthy()
        expect(localStorage.getItem('foo')).toEqual('"bar"')
    })

    it('should correctly update localStorage', () => {
        const { result, rerender } = renderHook(() =>
            useLocalStorage('foo', 'bar'),
        )

        const [, setFoo] = result.current
        act(() => setFoo('baz'))
        rerender()

        expect(localStorage.getItem('foo')).toEqual('"baz"')
    })

    it('should return and allow null setting', () => {
        localStorage.setItem('foo', 'null')
        const { result, rerender } = renderHook(() =>
            useLocalStorage<string | null>('foo', 'hum'),
        )
        const [foo1, setFoo] = result.current
        act(() => setFoo(null))
        rerender()

        const [foo2] = result.current
        expect(foo1).toEqual(null)
        expect(foo2).toEqual(null)
    })

    it('should return and allow undefined setting', () => {
        localStorage.setItem('foo', 'undefined')
        const { result, rerender } = renderHook(() =>
            useLocalStorage<string | undefined>('foo', 'hum'),
        )
        const [foo1, setFoo] = result.current
        act(() => setFoo(undefined))
        rerender()

        const [foo2] = result.current
        expect(foo1).toEqual(undefined)
        expect(foo2).toEqual(undefined)
    })

    it('should work fine if default value is undefined', () => {
        const { rerender, result } = renderHook(() =>
            useLocalStorage<string | undefined>('foo', undefined),
        )
        const [, setFoo] = result.current

        act(() => setFoo('bar'))
        expect(localStorage.getItem('foo')).toEqual('"bar"')

        act(() => setFoo(undefined))
        rerender()
        const [foo] = result.current

        expect(foo).toEqual(undefined)
        expect(localStorage.getItem('foo')).toEqual('undefined')
    })

    it('should work fine if default value is null', () => {
        const { rerender, result } = renderHook(() =>
            useLocalStorage<string | null>('foo', null),
        )
        const [, setFoo] = result.current
        act(() => setFoo('bar'))
        expect(localStorage.getItem('foo')).toEqual('"bar"')

        act(() => setFoo(null))
        rerender()
        const [foo] = result.current

        expect(foo).toEqual(null)
        expect(localStorage.getItem('foo')).toEqual('null')
    })

    it('should set initialState if initialState is an object', () => {
        renderHook(() => useLocalStorage('foo', { bar: true }))
        expect(localStorage.getItem('foo')).toEqual('{"bar":true}')
    })

    it('should correctly and promptly return a new value', () => {
        const { result, rerender } = renderHook(() =>
            useLocalStorage('foo', 'bar'),
        )

        const [, setFoo] = result.current
        act(() => setFoo('baz'))
        rerender()

        const [foo] = result.current
        expect(foo).toEqual('baz')
    })

    it('should reinitialize state when key changes', () => {
        let key = 'foo'
        const { result, rerender } = renderHook(() =>
            useLocalStorage(key, 'bar'),
        )

        const [, setState] = result.current
        act(() => setState('baz'))
        key = 'bar'
        rerender()

        const [state] = result.current
        expect(state).toEqual('bar')
    })

    it('should parse out objects from localStorage', () => {
        localStorage.setItem('foo', JSON.stringify({ ok: true }))
        const { result } = renderHook(() =>
            useLocalStorage<{ ok: boolean }>('foo', { ok: false }),
        )
        const [foo] = result.current
        expect(foo.ok).toEqual(true)
    })

    it('should safely initialize objects to localStorage', () => {
        const { result } = renderHook(() =>
            useLocalStorage('foo', { ok: true }),
        )
        const [foo] = result.current
        expect(foo.ok).toEqual(true)
    })

    it('should safely set objects to localStorage', () => {
        const { result, rerender } = renderHook(() =>
            useLocalStorage<{ ok: any }>('foo', { ok: true }),
        )

        const [, setFoo] = result.current
        act(() => setFoo({ ok: 'bar' }))
        rerender()

        const [foo] = result.current
        expect(foo.ok).toEqual('bar')
    })

    it('should safely return objects from updates', () => {
        const { result, rerender } = renderHook(() =>
            useLocalStorage<{ ok: any }>('foo', { ok: true }),
        )

        const [, setFoo] = result.current
        act(() => setFoo({ ok: 'bar' }))
        rerender()

        const [foo] = result.current
        expect(foo).toBeInstanceOf(Object)
        expect(foo.ok).toEqual('bar')
    })

    it('should set localStorage from the function updater', () => {
        const { result, rerender } = renderHook(() =>
            useLocalStorage<{ foo: string; fizz?: string }>('foo', {
                foo: 'bar',
            }),
        )

        const [, setFoo] = result.current

        act(() => setFoo((state) => ({ ...state, fizz: 'buzz' })))
        rerender()

        const [value] = result.current
        expect(value.foo).toEqual('bar')
        expect(value.fizz).toEqual('buzz')

        // Make sure it doesn't use the initial state as argument for the next calls
        act(() => setFoo((state) => ({ ...state })))
        rerender()

        const [sameValue] = result.current
        expect(sameValue.foo).toEqual('bar')
        expect(sameValue.fizz).toEqual('buzz')
    })

    it('should keep multiple hooks accessing the same key in sync', () => {
        localStorage.setItem('foo', 'bar')
        const hook = renderHook(() => useLocalStorage('foo', 'default1'))
        const otherHook = renderHook(() => useLocalStorage('foo', 'default2'))

        const [, setFoo] = hook.result.current
        act(() => setFoo('potato'))
        hook.rerender()
        otherHook.rerender()

        const [value] = hook.result.current
        const [otherValue] = otherHook.result.current

        expect(value).toEqual(otherValue)
        expect(value).toEqual('potato')
        expect(otherValue).toEqual('potato')
    })

    it('should react to local storage updates from other tab', () => {
        const hook = renderHook(() => useLocalStorage('foo', 'default'))

        act(() => {
            localStorage.setItem('foo', '"bizz"')
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: 'foo',
                }),
            )
        })

        const [value] = hook.result.current
        expect(value).toEqual('bizz')
    })

    it('should fallback to default value when update from other tab reveals key has been removed', () => {
        localStorage.setItem('foo', '"bar"')
        const hook = renderHook(() => useLocalStorage('foo', 'default'))

        const [firstValue] = hook.result.current
        expect(firstValue).toEqual('bar')

        act(() => {
            localStorage.removeItem('foo')
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: 'foo',
                }),
            )
        })

        const [updatedValue] = hook.result.current
        expect(updatedValue).toEqual('default')
    })

    it('should take "undefined" into account when set from another tab', () => {
        localStorage.setItem('foo', '"bar"')
        const hook = renderHook(() => useLocalStorage('foo', 'default'))

        const [firstValue] = hook.result.current
        expect(firstValue).toEqual('bar')

        act(() => {
            localStorage.setItem('foo', 'undefined')
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: 'foo',
                }),
            )
        })

        const [updatedValue] = hook.result.current
        expect(updatedValue).toEqual(undefined)
    })

    it("should not react to local storage updates from other tab if it's not the same key", () => {
        const hook = renderHook(() => useLocalStorage('foo', 'default'))

        act(() => {
            localStorage.setItem('moo', '"bizz"')
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: 'moo',
                }),
            )
            window.dispatchEvent(
                new StorageEvent('local-storage', {
                    key: 'moo',
                }),
            )
        })

        const [value] = hook.result.current
        expect(value).toEqual('default')
    })

    it('should clear local storage when calling remove and fallback to defaultValue', () => {
        localStorage.setItem('foo', 'bar')
        const { result } = renderHook(() => useLocalStorage('foo', 'default'))

        const [, , remove] = result.current
        act(() => remove())

        const [value] = result.current
        expect(value).toEqual('default')
        expect(localStorage.getItem('foo')).toBeNull()
    })

    describe('Integrates with rules of hooks when enforced by eslint', () => {
        it('should memoize an object between rerenders', () => {
            const { result, rerender } = renderHook(() =>
                useLocalStorage('foo', { ok: true }),
            )
            rerender()
            const [r2] = result.current
            rerender()
            const [r3] = result.current
            expect(r2).toBe(r3)
        })

        it('should memoize an object immediately if localStorage is already set', () => {
            localStorage.setItem('foo', JSON.stringify({ ok: true }))
            const { result, rerender } = renderHook(() =>
                useLocalStorage('foo', { ok: true }),
            )

            const [r1] = result.current // if localStorage isn't set then r1 and r2 will be different
            rerender()
            const [r2] = result.current
            expect(r1).toBe(r2)
        })

        it('should memoize the setState function', () => {
            localStorage.setItem('foo', JSON.stringify({ ok: true }))
            const { result, rerender } = renderHook(() =>
                useLocalStorage('foo', { ok: true }),
            )
            const [, s1] = result.current
            rerender()
            const [, s2] = result.current
            expect(s1).toBe(s2)
        })
    })
})
