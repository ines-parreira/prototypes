import { ComponentType, PropsWithChildren } from 'react'

import {
    renderHook as baseRenderHook,
    RenderHookResult as BaseRenderHookResult,
    act as reactHooksAct,
    RenderHookOptions,
    WrapperComponent,
} from '@testing-library/react-hooks'

/**
 * @deprecated waitForNextUpdate is removed.
 * Please use `waitFor` from '@testing-library/react' instead.
 */
export type WaitForNextUpdate = never

export type RenderHookResult<Props, Result> = Omit<
    BaseRenderHookResult<Props, Result>,
    'waitForNextUpdate'
> & {
    /**
     * @deprecated waitForNextUpdate is removed.
     * Please use `waitFor` from '@testing-library/react' instead.
     */
    waitForNextUpdate?: WaitForNextUpdate
}

/**
 * Wrapper around `renderHook` that supports:
 * - A default wrapper (for global providers)
 * - Optional override of the wrapper per test
 * - Generic support for typed `renderHook` calls like renderHook<Props, Result>()
 */
export function renderHook<Props, Result = unknown>(
    callback: (props: Props) => Result,
    options?: Omit<RenderHookOptions<Props>, 'wrapper'> & {
        // TODO(React18): Delete <unknown> once we upgrade to React 18 types
        wrapper?: ComponentType<PropsWithChildren<unknown>>
    },
): RenderHookResult<Props, Result> {
    return baseRenderHook(callback, {
        ...options,
        wrapper: options?.wrapper as unknown as WrapperComponent<Props>,
    }) as unknown as RenderHookResult<Props, Result>
}

// Re-export the current `act` from react-hooks (can be swapped later)
export const act = reactHooksAct

export type { RenderHookOptions }
