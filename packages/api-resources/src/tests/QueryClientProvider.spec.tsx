import { NodeEnv } from '@repo/utils'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { render, screen } from '@testing-library/react'

import { appQueryClient } from '../queryClient'
import { QueryClientProvider } from '../QueryClientProvider'
import {
    asyncStoragePersister,
    PERSIST_MAX_AGE,
    shouldDehydrateQuery,
} from '../queryPersister'
import { SDK_VERSION_HASH } from '../sdkVersionHash'

const { mockEnvVars } = vi.hoisted(() => ({
    mockEnvVars: { NODE_ENV: 'development' as string | undefined },
}))

vi.mock('@repo/utils', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@repo/utils')>()
    return {
        ...actual,
        get envVars() {
            return mockEnvVars
        },
    }
})

vi.mock('@tanstack/react-query-persist-client', () => ({
    PersistQueryClientProvider: vi.fn(({ children }) => <div>{children}</div>),
}))

vi.mock('@tanstack/react-query-devtools', () => ({
    ReactQueryDevtools: vi.fn(() => <div>ReactQueryDevtools</div>),
}))

vi.mock('../queryClient', () => ({
    appQueryClient: { mount: vi.fn() },
}))

vi.mock('../queryPersister', () => ({
    asyncStoragePersister: { getItem: vi.fn(), setItem: vi.fn() },
    PERSIST_MAX_AGE: 86400000,
    SDK_VERSION_HASH: 'testhash',
    shouldDehydrateQuery: vi.fn(),
}))

describe('QueryClientProvider', () => {
    it('renders children inside PersistQueryClientProvider', () => {
        render(
            <QueryClientProvider>
                <div>child content</div>
            </QueryClientProvider>,
        )

        expect(screen.getByText('child content')).toBeInTheDocument()
    })

    it('passes correct persistOptions to PersistQueryClientProvider', () => {
        render(
            <QueryClientProvider>
                <div />
            </QueryClientProvider>,
        )

        expect(PersistQueryClientProvider).toHaveBeenCalledWith(
            expect.objectContaining({
                client: appQueryClient,
                persistOptions: {
                    queryClient: appQueryClient,
                    persister: asyncStoragePersister,
                    maxAge: PERSIST_MAX_AGE,
                    buster: SDK_VERSION_HASH,
                    dehydrateOptions: {
                        shouldDehydrateQuery,
                    },
                },
            }),
            expect.anything(),
        )
    })

    it('renders ReactQueryDevtools in non-production environments', () => {
        mockEnvVars.NODE_ENV = NodeEnv.Development

        render(
            <QueryClientProvider>
                <div />
            </QueryClientProvider>,
        )

        expect(screen.getByText('ReactQueryDevtools')).toBeInTheDocument()
    })

    it('does not render ReactQueryDevtools in production', () => {
        mockEnvVars.NODE_ENV = NodeEnv.Production

        render(
            <QueryClientProvider>
                <div />
            </QueryClientProvider>,
        )

        expect(screen.queryByText('ReactQueryDevtools')).not.toBeInTheDocument()
    })
})
