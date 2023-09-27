import React, {FC, ReactElement} from 'react'
import {
    QueryCache,
    QueryClient,
    QueryClientProvider,
    QueryKey,
} from '@tanstack/react-query'
import {render} from '@testing-library/react'

import {queryCacheConfigWithoutRedux} from 'api/queryCacheConfig'

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
        queryCache: new QueryCache(queryCacheConfigWithoutRedux),
    })

    if (cachedData) {
        for (const [key, data] of cachedData) {
            queryClient.setQueryData(key, {data})
        }
    }

    return queryClient
}

export function mockQueryClientProvider() {
    const queryClient = mockQueryClient()
    const TestQueryClientProvider: FC = (props) => (
        <QueryClientProvider client={queryClient} {...props} />
    )
    return TestQueryClientProvider
}

export const renderWithQueryClientProvider = (ui: ReactElement) => {
    const queryClient = mockQueryClient()

    return render(ui, {
        wrapper: ({children}: any) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        ),
    })
}
