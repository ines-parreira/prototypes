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
import type { Mock } from 'vitest'
import { vi } from 'vitest'

export const testAppQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
        mutations: {
            retry: false,
        },
    },
})

/**
 * Creates a QueryClient for testing with optional spies
 */
export function createTestQueryClient(options?: {
    withInvalidateQueriesSpy?: boolean
    withCancelQueriesSpy?: boolean
}) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    const spies = {} as {
        invalidateQueries?: ReturnType<typeof vi.spyOn>
        cancelQueries?: ReturnType<typeof vi.spyOn>
    }

    if (options?.withInvalidateQueriesSpy) {
        spies.invalidateQueries = vi.spyOn(
            queryClient,
            'invalidateQueries',
        ) as any
    }

    if (options?.withCancelQueriesSpy) {
        spies.cancelQueries = vi
            .spyOn(queryClient, 'cancelQueries')
            .mockResolvedValue(undefined as any) as any
    }

    return { queryClient, spies }
}

/**
 * Gets the mutation configuration passed to a mocked hook
 */
export function getMutationConfig<T = any>(mockedHook: Mock): T | undefined {
    return mockedHook.mock.calls[0]?.[0]
}

export const RenderHookWrapperComponent = ({
    children,
    queryClient = testAppQueryClient,
}: {
    children: React.ReactNode
    queryClient?: QueryClient
}) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>

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
