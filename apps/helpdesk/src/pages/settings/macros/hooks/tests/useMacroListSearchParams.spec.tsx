import { renderHook } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { useMacroListSearchParams } from '../useMacroListSearchParams'

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

describe('useMacroListSearchParams', () => {
    it('should return default order_by when no search params exist', () => {
        const { result } = renderHook(() => useMacroListSearchParams(), {
            wrapper: createWrapper('/'),
        })

        const [params] = result.current
        expect(params.order_by).toBe('created_datetime:asc')
        expect(params.search).toBeUndefined()
        expect(params.tags).toBeUndefined()
        expect(params.languages).toBeUndefined()
        expect(params.cursor).toBeUndefined()
    })

    it('should parse search param from URL', () => {
        const { result } = renderHook(() => useMacroListSearchParams(), {
            wrapper: createWrapper('/?search=test'),
        })

        const [params] = result.current
        expect(params.search).toBe('test')
    })

    it('should parse tags as comma-separated array', () => {
        const { result } = renderHook(() => useMacroListSearchParams(), {
            wrapper: createWrapper('/?tags=support,billing'),
        })

        const [params] = result.current
        expect(params.tags).toEqual(['support', 'billing'])
    })

    it('should parse languages with null appended', () => {
        const { result } = renderHook(() => useMacroListSearchParams(), {
            wrapper: createWrapper('/?languages=en,fr'),
        })

        const [params] = result.current
        expect(params.languages).toEqual(['en', 'fr', null])
    })

    it('should parse order_by from URL', () => {
        const { result } = renderHook(() => useMacroListSearchParams(), {
            wrapper: createWrapper('/?order_by=name:desc'),
        })

        const [params] = result.current
        expect(params.order_by).toBe('name:desc')
    })

    it('should parse cursor from URL', () => {
        const { result } = renderHook(() => useMacroListSearchParams(), {
            wrapper: createWrapper('/?cursor=abc123'),
        })

        const [params] = result.current
        expect(params.cursor).toBe('abc123')
    })

    it('should parse multiple params from URL', () => {
        const { result } = renderHook(() => useMacroListSearchParams(), {
            wrapper: createWrapper(
                '/?search=test&tags=support&order_by=name:asc&cursor=xyz',
            ),
        })

        const [params] = result.current
        expect(params.search).toBe('test')
        expect(params.tags).toEqual(['support'])
        expect(params.order_by).toBe('name:asc')
        expect(params.cursor).toBe('xyz')
    })

    it('should update search params', () => {
        const { result } = renderHook(() => useMacroListSearchParams(), {
            wrapper: createWrapper('/'),
        })

        act(() => {
            result.current[1]({ search: 'foobar', order_by: 'name:asc' })
        })

        expect(result.current[0].search).toBe('foobar')
        expect(result.current[0].order_by).toBe('name:asc')
    })

    it('should support functional updates', () => {
        const { result } = renderHook(() => useMacroListSearchParams(), {
            wrapper: createWrapper('/?search=initial'),
        })

        act(() => {
            result.current[1]((prev) => ({
                ...prev,
                tags: ['support'],
            }))
        })

        expect(result.current[0].search).toBe('initial')
        expect(result.current[0].tags).toEqual(['support'])
    })

    it('should clear cursor when updating search', () => {
        const { result } = renderHook(() => useMacroListSearchParams(), {
            wrapper: createWrapper('/?cursor=abc123'),
        })

        act(() => {
            result.current[1]((prev) => ({
                ...prev,
                search: 'new search',
                cursor: undefined,
            }))
        })

        expect(result.current[0].cursor).toBeUndefined()
        expect(result.current[0].search).toBe('new search')
    })

    it('should not include default order_by in URL when set to default', () => {
        const { result } = renderHook(() => useMacroListSearchParams(), {
            wrapper: createWrapper('/'),
        })

        act(() => {
            result.current[1]({
                search: 'test',
                order_by: 'created_datetime:asc',
            })
        })

        expect(result.current[0].order_by).toBe('created_datetime:asc')
        expect(result.current[0].search).toBe('test')
    })

    it('should remove params when set to undefined', () => {
        const { result } = renderHook(() => useMacroListSearchParams(), {
            wrapper: createWrapper('/?search=test&tags=support'),
        })

        act(() => {
            result.current[1]({
                search: undefined,
                tags: undefined,
                order_by: 'created_datetime:asc',
            })
        })

        expect(result.current[0].search).toBeUndefined()
        expect(result.current[0].tags).toBeUndefined()
    })

    it('should handle empty string search as undefined', () => {
        const { result } = renderHook(() => useMacroListSearchParams(), {
            wrapper: createWrapper('/'),
        })

        act(() => {
            result.current[1]({
                search: '',
                order_by: 'created_datetime:asc',
            })
        })

        expect(result.current[0].search).toBeUndefined()
    })

    it('should handle empty tags array as undefined', () => {
        const { result } = renderHook(() => useMacroListSearchParams(), {
            wrapper: createWrapper('/?tags=support'),
        })

        act(() => {
            result.current[1]({
                tags: [],
                order_by: 'created_datetime:asc',
            })
        })

        expect(result.current[0].tags).toBeUndefined()
    })
})
