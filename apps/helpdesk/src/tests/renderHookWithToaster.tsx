import { renderHook } from '@repo/testing'
import type { RenderHookOptions } from '@testing-library/react'

/**
 * @deprecated Use `renderHook` from `@repo/testing` instead.
 */
export const renderHookWithToaster = <TProps, TResult>(
    callback: (props: TProps) => TResult,
    options: Omit<RenderHookOptions<TProps>, 'wrapper'> = {},
) =>
    renderHook(callback, {
        ...options,
    })
