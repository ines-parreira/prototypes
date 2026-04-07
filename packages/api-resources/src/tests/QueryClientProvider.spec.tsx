import { NodeEnv } from '@repo/utils'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { render, screen } from '@testing-library/react'

import { appQueryClient } from '../queryClient'
import { QueryClientProvider } from '../QueryClientProvider'

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

vi.mock('@tanstack/react-query-persist-client', async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import('@tanstack/react-query-persist-client')
        >()
    return {
        ...actual,
        PersistQueryClientProvider: vi.fn(({ children }) => (
            <div>{children}</div>
        )),
    }
})

vi.mock('@tanstack/react-query-devtools', () => ({
    ReactQueryDevtools: vi.fn(() => <div>ReactQueryDevtools</div>),
}))

vi.mock('../queryClient', () => ({
    appQueryClient: { mount: vi.fn() },
}))

vi.mock('../queryPersister', () => ({
    asyncStoragePersister: {},
    PERSIST_MAX_AGE: 86400000,
    shouldPersistQuery: vi.fn(),
}))

vi.mock('../sdkVersionHash', () => ({
    SDK_VERSION_HASH: 'test-hash',
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

    it('passes appQueryClient to PersistQueryClientProvider', () => {
        render(
            <QueryClientProvider>
                <div />
            </QueryClientProvider>,
        )

        expect(PersistQueryClientProvider).toHaveBeenCalledWith(
            expect.objectContaining({
                client: appQueryClient,
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
