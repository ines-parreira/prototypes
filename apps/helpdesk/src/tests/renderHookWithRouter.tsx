import { renderHook } from '@repo/testing'
import type { RenderHookOptions } from '@repo/testing'
import { MemoryRouter } from 'react-router-dom'

type RenderHookWithRouterOptions<TProps> = {
    initialEntries?: [string]
    renderHookOptions?: Omit<RenderHookOptions<TProps>, 'wrapper'>
}

/**
 * Utility function to render a hook with React Router
 * @param callback The hook to test
 * @param options Configuration options
 * @returns The result of renderHook with a router wrapper
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
