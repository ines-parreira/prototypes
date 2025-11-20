import type {
    RenderHookResult as BaseRenderHookResult,
    RenderHookOptions,
} from '@testing-library/react'

/**
 * @deprecated waitForNextUpdate is removed.
 * Please use `waitFor` from '@testing-library/react' instead.
 */
export type WaitForNextUpdate = never

export type RenderHookResult<Props, Result> = BaseRenderHookResult<
    Props,
    Result
>

export { act, renderHook } from '@testing-library/react'
export type { RenderHookOptions }
