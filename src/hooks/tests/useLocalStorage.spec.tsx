import {renderHook, act} from '@testing-library/react-hooks'
import useLocalStorage from '../useLocalStorage'

describe('useLocalStorage', () => {
    afterEach(() => {
        localStorage.clear()
    })

    it('should retrieve an existing value from localStorage', () => {
        localStorage.setItem('foo', '"bar"')
        const {result} = renderHook(() => useLocalStorage('foo'))
        const [state] = result.current
        expect(state).toEqual('bar')
    })

    it('should return initialValue if localStorage empty and set that to localStorage', () => {
        const {result} = renderHook(() => useLocalStorage('foo', 'bar'))
        const [state] = result.current
        expect(state).toEqual('bar')
        expect(localStorage.getItem('foo')).toEqual('"bar"')
    })

    it('should prefer existing value over initial state', () => {
        localStorage.setItem('foo', '"bar"')
        const {result} = renderHook(() => useLocalStorage('foo', 'baz'))
        const [state] = result.current
        expect(state).toEqual('bar')
    })

    it('should not clobber existing localStorage with initialState', () => {
        localStorage.setItem('foo', '"bar"')
        const {result} = renderHook(() => useLocalStorage('foo', 'buzz'))
        expect(result.current).toBeTruthy()
        expect(localStorage.getItem('foo')).toEqual('"bar"')
    })

    it('should correctly update localStorage', () => {
        const {result, rerender} = renderHook(() =>
            useLocalStorage('foo', 'bar')
        )

        const [, setFoo] = result.current
        act(() => setFoo('baz'))
        rerender()

        expect(localStorage.getItem('foo')).toEqual('"baz"')
    })

    it('should return undefined if no initialValue provided and localStorage empty', () => {
        const {result} = renderHook(() => useLocalStorage('some_key'))

        expect(result.current[0]).toBeUndefined()
    })

    it('should return and allow null setting', () => {
        localStorage.setItem('foo', 'null')
        const {result, rerender} = renderHook(() => useLocalStorage('foo'))
        const [foo1, setFoo] = result.current
        act(() => setFoo(null))
        rerender()

        const [foo2] = result.current
        expect(foo1).toEqual(null)
        expect(foo2).toEqual(null)
    })

    it('should set initialState if initialState is an object', () => {
        renderHook(() => useLocalStorage('foo', {bar: true}))
        expect(localStorage.getItem('foo')).toEqual('{"bar":true}')
    })

    it('should correctly and promptly return a new value', () => {
        const {result, rerender} = renderHook(() =>
            useLocalStorage('foo', 'bar')
        )

        const [, setFoo] = result.current
        act(() => setFoo('baz'))
        rerender()

        const [foo] = result.current
        expect(foo).toEqual('baz')
    })

    it('should reinitialize state when key changes', () => {
        let key = 'foo'
        const {result, rerender} = renderHook(() => useLocalStorage(key, 'bar'))

        const [, setState] = result.current
        act(() => setState('baz'))
        key = 'bar'
        rerender()

        const [state] = result.current
        expect(state).toEqual('bar')
    })

    it('should parse out objects from localStorage', () => {
        localStorage.setItem('foo', JSON.stringify({ok: true}))
        const {result} = renderHook(() => useLocalStorage<{ok: boolean}>('foo'))
        const [foo] = result.current
        expect(foo!.ok).toEqual(true)
    })

    it('should safely initialize objects to localStorage', () => {
        const {result} = renderHook(() => useLocalStorage('foo', {ok: true}))
        const [foo] = result.current
        expect(foo!.ok).toEqual(true)
    })

    it('should safely set objects to localStorage', () => {
        const {result, rerender} = renderHook(() =>
            useLocalStorage<{ok: any}>('foo', {ok: true})
        )

        const [, setFoo] = result.current
        act(() => setFoo({ok: 'bar'}))
        rerender()

        const [foo] = result.current
        expect(foo!.ok).toEqual('bar')
    })

    it('should safely return objects from updates', () => {
        const {result, rerender} = renderHook(() =>
            useLocalStorage<{ok: any}>('foo', {ok: true})
        )

        const [, setFoo] = result.current
        act(() => setFoo({ok: 'bar'}))
        rerender()

        const [foo] = result.current
        expect(foo).toBeInstanceOf(Object)
        expect(foo!.ok).toEqual('bar')
    })

    it('should set localStorage from the function updater', () => {
        const {result, rerender} = renderHook(() =>
            useLocalStorage<{foo: string; fizz?: string}>('foo', {foo: 'bar'})
        )

        const [, setFoo] = result.current
        act(() => setFoo((state) => ({...state!, fizz: 'buzz'})))
        rerender()

        const [value] = result.current
        expect(value!.foo).toEqual('bar')
        expect(value!.fizz).toEqual('buzz')
    })

    it('should reject nullish or undefined keys', () => {
        const {result} = renderHook(() => useLocalStorage(null as any))
        try {
            ;(() => {
                // Keep this IIFE, reason: `fail is not defined`
                return result.current
            })()
            fail('hook should have thrown')
        } catch (e) {
            expect(String(e)).toMatch(/key may not be/i)
        }
    })

    describe('Integrates with rules of hooks when enforced by eslint', () => {
        it('should memoize an object between rerenders', () => {
            const {result, rerender} = renderHook(() =>
                useLocalStorage('foo', {ok: true})
            )
            rerender()
            const [r2] = result.current
            rerender()
            const [r3] = result.current
            expect(r2).toBe(r3)
        })

        it('should memoize an object immediately if localStorage is already set', () => {
            localStorage.setItem('foo', JSON.stringify({ok: true}))
            const {result, rerender} = renderHook(() =>
                useLocalStorage('foo', {ok: true})
            )

            const [r1] = result.current // if localStorage isn't set then r1 and r2 will be different
            rerender()
            const [r2] = result.current
            expect(r1).toBe(r2)
        })

        it('should memoize the setState function', () => {
            localStorage.setItem('foo', JSON.stringify({ok: true}))
            const {result, rerender} = renderHook(() =>
                useLocalStorage('foo', {ok: true})
            )
            const [, s1] = result.current
            rerender()
            const [, s2] = result.current
            expect(s1).toBe(s2)
        })
    })

    describe('Options: raw', () => {
        it('should return a string when localStorage is a stringified object', () => {
            localStorage.setItem('foo', JSON.stringify({fizz: 'buzz'}))
            const {result} = renderHook(() =>
                useLocalStorage('foo', null, {raw: true})
            )
            const [foo] = result.current
            expect(typeof foo).toBe('string')
        })

        it('should return a string after an update and be equivalent to initial value', () => {
            const storedObject = {fizz: 'bang'}

            localStorage.setItem('foo', JSON.stringify({fizz: 'buzz'}))
            const {result, rerender} = renderHook(() =>
                useLocalStorage('foo', null, {raw: true})
            )

            const [, setFoo] = result.current

            act(() => setFoo(storedObject as any))
            rerender()

            const [foo] = result.current
            expect(typeof foo).toBe('string')

            expect(JSON.parse(foo!)).toBeInstanceOf(Object)
            expect(JSON.parse(foo!)).toEqual(storedObject)
        })
    })
})
