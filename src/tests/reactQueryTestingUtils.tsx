import React, {FC} from 'react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

export function createTestQueryClient() {
    // config recommended by documentation for query client being used inside tests
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
        logger: {
            // eslint-disable-next-line no-console
            log: console.log,
            warn: console.warn,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            error: () => {},
        },
    })
}

export function createTestQueryClientProvider() {
    const queryClient = createTestQueryClient()
    const TestQueryClientProvider: FC = (props) => (
        <QueryClientProvider client={queryClient} {...props} />
    )
    return TestQueryClientProvider
}
