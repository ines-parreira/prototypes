import { renderHook } from '@repo/testing'
import type { RenderHookOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

type RenderHookWithRouterOptions<TProps> = {
    initialEntries?: [string]
    renderHookOptions?: Omit<RenderHookOptions<TProps>, 'wrapper'>
}

/**
 * @deprecated Use `renderHook` from `@repo/testing` instead.
 */
export function renderHookWithRouter<TProps, TResult>(
    callback: (props: TProps) => TResult,
    {
        initialEntries = ['/'],
        renderHookOptions = {},
    }: RenderHookWithRouterOptions<TProps> = {},
) {
    return {
        ...renderHook(callback, {
            wrapper: ({ children }) => (
                <MemoryRouter initialEntries={initialEntries}>
                    {children}
                </MemoryRouter>
            ),
            ...renderHookOptions,
        }),
        history,
    }
}
