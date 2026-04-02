import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import type { RenderOptions } from '@testing-library/react'
import { render as renderPrimitive } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { createTestQueryClient } from './createTestQueryClient'

type SharedRenderOptions = RenderOptions & {
    initialEntries?: string[]
    path?: string
}

export const render = (
    ui: React.ReactElement,
    options?: SharedRenderOptions,
) => {
    const ExtraWrapper = options?.wrapper
    const initialEntries = options?.initialEntries ?? ['/']
    const path = options?.path ?? '/'

    const user = userEvent.setup()

    const result = renderPrimitive(ui, {
        ...options,
        wrapper: ({ children }) => (
            <QueryClientProvider client={createTestQueryClient()}>
                <MemoryRouter initialEntries={initialEntries}>
                    <Route path={path}>
                        {ExtraWrapper ? (
                            <ExtraWrapper>{children}</ExtraWrapper>
                        ) : (
                            children
                        )}
                    </Route>
                </MemoryRouter>
            </QueryClientProvider>
        ),
    })

    return {
        user,
        ...result,
    }
}
