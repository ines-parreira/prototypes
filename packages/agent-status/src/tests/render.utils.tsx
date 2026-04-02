import type { ReactElement } from 'react'

import { createTestQueryClient } from '@repo/testing/vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import type { RenderOptions } from '@testing-library/react'
import { render as rtlRender } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { Mock } from 'vitest'
import { vi } from 'vitest'

export function createTestQueryClientWithSpies(options?: {
    withInvalidateQueriesSpy?: boolean
    withCancelQueriesSpy?: boolean
}) {
    const queryClient = createTestQueryClient()

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

export function getMutationConfig<T = any>(mockedHook: Mock): T | undefined {
    return mockedHook.mock.calls[0]?.[0]
}

export function render(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) {
    return {
        user: userEvent.setup(),
        ...rtlRender(ui, {
            wrapper: ({ children }) => (
                <QueryClientProvider client={createTestQueryClient()}>
                    {children}
                </QueryClientProvider>
            ),
            ...options,
        }),
    }
}
