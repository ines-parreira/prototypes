import { useState } from 'react'
import type { ReactNode } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { SplitFactoryProvider } from '@splitsoftware/splitio-react'
import type { LDClient } from 'launchdarkly-js-client-sdk'
import { LDProvider } from 'launchdarkly-react-client-sdk'

import { getFactory } from './engines/harness'
import { getLDClient, LDContext } from './launchdarkly'

type FeatureFlagsProviderProps = {
    children: ReactNode
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
    const [ldClient, setLdClient] = useState<LDClient>()

    useEffectOnce(() => {
        const client = getLDClient()
        void client.waitUntilGoalsReady().then(() => {
            setLdClient(client)
        })
    })

    const splitFactory = getFactory()

    return (
        <LDProvider
            clientSideID={window.GORGIAS_LAUNCHDARKLY_CLIENT_ID}
            ldClient={ldClient}
            reactOptions={{ useCamelCaseFlagKeys: false }}
            context={LDContext}
        >
            <SplitFactoryProvider factory={splitFactory ?? undefined}>
                {children}
            </SplitFactoryProvider>
        </LDProvider>
    )
}
