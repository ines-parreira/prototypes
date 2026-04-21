import { renderHook } from '@repo/testing'
import type { RenderHookOptions } from '@repo/testing'
import { createPortal } from 'react-dom'

import { Toaster } from '@gorgias/axiom'

const toaster = createPortal(<Toaster />, document.body)

export const renderHookWithToaster = <TProps, TResult>(
    callback: (props: TProps) => TResult,
    options: Omit<RenderHookOptions<TProps>, 'wrapper'> = {},
) =>
    renderHook(callback, {
        wrapper: ({ children }) => (
            <>
                {toaster}
                {children}
            </>
        ),
        ...options,
    })
