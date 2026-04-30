import type { FC, PropsWithChildren } from 'react'

import type { QueryKey } from '@tanstack/react-query'
import {
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

export function mockQueryClient({
    cachedData,
}: {
    cachedData?: [QueryKey, unknown][]
} = {}) {
    // config recommended by documentation for query client being used inside tests
    const queryClient = new QueryClient({
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
        queryCache: new QueryCache(),
    })

    if (cachedData) {
        for (const [key, data] of cachedData) {
            queryClient.setQueryData(key, { data })
        }
    }

    return queryClient
}

export function mockQueryClientProvider() {
    const queryClient = mockQueryClient()
    // TODO(React18): Delete <unknown> once we upgrade to React 18 types
    const TestQueryClientProvider: FC<PropsWithChildren<unknown>> = ({
        children,
        ...props
    }) => (
        <QueryClientProvider client={queryClient} {...props}>
            {children}
        </QueryClientProvider>
    )
    return { QueryClientProvider: TestQueryClientProvider, queryClient }
}
