import type { ReactNode } from 'react'

import { envVars, NodeEnv } from '@repo/utils'
import { QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { appQueryClient } from './queryClient'

export function QueryClientProvider({ children }: { children: ReactNode }) {
    return (
        <TanstackQueryClientProvider client={appQueryClient}>
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
        </TanstackQueryClientProvider>
    )
}
