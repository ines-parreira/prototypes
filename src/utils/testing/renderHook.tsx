import {
    renderHook as baseRenderHook,
    act as reactHooksAct,
    RenderHookOptions,
    RenderHookResult,
} from '@testing-library/react-hooks'

/**
 * Wrapper around `renderHook` that supports:
 * - A default wrapper (for global providers)
 * - Optional override of the wrapper per test
 * - Generic support for typed `renderHook` calls like renderHook<Props, Result>()
 */
export function renderHook<Props, Result = unknown>(
    callback: (props: Props) => Result,
    options?: Omit<RenderHookOptions<Props>, 'wrapper'> & {
        wrapper?: RenderHookOptions<Props>['wrapper']
    },
): RenderHookResult<Props, Result> {
    return baseRenderHook(callback, {
        wrapper: options?.wrapper,
        ...options,
    })
}

// Re-export the current `act` from react-hooks (can be swapped later)
export const act = reactHooksAct

// Re-export these types for convenience
export type { RenderHookOptions, RenderHookResult }
