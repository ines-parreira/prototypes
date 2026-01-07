import type { ReactElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type {
    RenderHookOptions as RenderHookOptionsPrimitive,
    RenderOptions,
} from '@testing-library/react'
import {
    renderHook as renderHookPrimitive,
    render as rtlRender,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

export const testAppQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            cacheTime: 0,
            staleTime: 0,
        },
        mutations: {
            retry: false,
        },
    },
})

export const RenderHookWrapperComponent = ({
    children,
}: {
    children: React.ReactNode
}) => (
    <QueryClientProvider client={testAppQueryClient}>
        {children}
    </QueryClientProvider>
)

export function render(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) {
    return {
        user: userEvent.setup(),
        ...rtlRender(ui, { wrapper: RenderHookWrapperComponent, ...options }),
    }
}

export const renderHook = <TProps, TResult>(
    hook: (props: TProps) => TResult,
    options?: RenderHookOptionsPrimitive<TProps>,
) => {
    return renderHookPrimitive(hook, {
        ...options,
        wrapper: RenderHookWrapperComponent,
    })
}
