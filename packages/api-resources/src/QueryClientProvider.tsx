import type { ReactNode } from 'react'

import { envVars, NodeEnv } from '@repo/utils'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

import { appQueryClient } from './queryClient'
import {
    asyncStoragePersister,
    PERSIST_MAX_AGE,
    shouldDehydrateQuery,
} from './queryPersister'
import { SDK_VERSION_HASH } from './sdkVersionHash'

const persistOptions: PersistQueryClientOptions = {
    queryClient: appQueryClient,
    persister: asyncStoragePersister,
    maxAge: PERSIST_MAX_AGE,
    buster: SDK_VERSION_HASH,
    dehydrateOptions: {
        shouldDehydrateQuery,
    },
}

export function QueryClientProvider({ children }: { children: ReactNode }) {
    return (
        <PersistQueryClientProvider
            client={appQueryClient}
            persistOptions={persistOptions}
        >
            {children}
            {envVars.NODE_ENV !== NodeEnv.Production && (
                <ReactQueryDevtools
                    initialIsOpen={false}
                    position="bottom-left"
                    panelPosition="bottom"
                    toggleButtonProps={{
                        style: { marginLeft: '54px', marginBottom: '15px' },
                    }}
                />
            )}
        </PersistQueryClientProvider>
    )
}
